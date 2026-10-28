import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators/index';
import { PrismaService } from '../../prisma/prisma.service';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('media')
export class MediaController {
  constructor(private prisma: PrismaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT', 'ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `media-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 Mo max
      },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/i)) {
          return cb(new BadRequestException('Format non supporté (JPG, PNG, WebP uniquement)'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Query('shopId') shopId?: string,
    @Query('productId') productId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Fichier requis');
    }

    const publicPath = `/uploads/${file.filename}`;

    // Si shopId est fourni, l'enregistrer dans MediaAsset
    let mediaAsset: any = null;
    if (shopId) {
      mediaAsset = await this.prisma.mediaAsset.create({
        data: {
          shopId,
          productId: productId || null,
          path: publicPath,
          type: 'image',
          size: file.size,
          moderationStatus: 'approved',
        },
      });
    }

    return {
      message: 'Fichier uploadé avec succès',
      url: publicPath,
      filename: file.filename,
      size: file.size,
      mediaAsset,
    };
  }
}
