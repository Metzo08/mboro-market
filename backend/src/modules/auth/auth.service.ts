import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(phone: string) {
    let user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { phone, status: 'PENDING_VERIFICATION', role: 'CUSTOMER' },
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.otpCode.upsert({
      where: { phone },
      update: { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      create: { phone, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    console.log(`[OTP] Code pour ${phone}: ${code}`);

    return { message: 'Code OTP envoyé', phone };
  }

  async verifyOtp(phone: string, code: string) {
    const otp = await this.prisma.otpCode.findUnique({ where: { phone } });

    if (!otp || otp.code !== code) {
      throw new UnauthorizedException('Code invalide');
    }

    if (otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Code expiré');
    }

    await this.prisma.otpCode.delete({ where: { phone } });
    await this.prisma.user.update({
      where: { phone },
      data: { phoneVerified: true, status: 'ACTIVE' },
    });

    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    const token = this.jwt.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role as any,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async register(data: { phone: string; email?: string; role?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) {
      throw new ConflictException('Ce numéro de téléphone est déjà utilisé');
    }

    const role = (data.role || 'CUSTOMER').toUpperCase();
    const user = await this.prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email,
        role: role as any,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Un commerçant doit pouvoir créer sa boutique immédiatement après vérification :
    // on lui crée une organisation personnelle (multi-boutiques possible ensuite).
    if (role === 'MERCHANT') {
      const slugBase = `org-${data.phone.replace(/[^0-9]/g, '')}`;
      const existingOrg = await this.prisma.organization.findUnique({ where: { slug: slugBase } });
      const organization =
        existingOrg ??
        (await this.prisma.organization.create({
          data: {
            name: `Organisation ${data.phone}`,
            slug: slugBase,
            ownerId: user.id,
            status: 'active',
            verificationStatus: 'pending',
          },
        }));
      await this.prisma.organizationMember.create({
        data: { organizationId: organization.id, userId: user.id, role: 'OWNER' },
      });
    }

    return { message: 'Compte créé, vérifiez votre téléphone', userId: user.id };
  }

  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user || !user.passwordHash) {
      return null;
    }
    const match = await bcrypt.compare(pass, user.passwordHash);
    if (!match) {
      return null;
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async generateTokens(user: any) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const access_token = this.jwt.sign(payload);
    return { access_token };
  }
}
