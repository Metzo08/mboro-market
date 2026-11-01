import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/index';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  /**
   * Health check détaillé (exigence CDC §12.1 : observabilité).
   * Public, léger, sans données sensibles : état DB + uptime + version.
   */
  @Public()
  @Get('health')
  async health() {
    const started = Date.now();
    let db = 'down';
    let dbLatencyMs: number | null = null;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'up';
      dbLatencyMs = Date.now() - started;
    } catch {
      db = 'down';
    }

    const memory = process.memoryUsage();

    return {
      status: db === 'up' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        database: {
          status: db,
          latencyMs: dbLatencyMs,
        },
        memory: {
          rssMb: Math.round(memory.rss / 1024 / 1024),
          heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        },
        node: process.version,
      },
    };
  }
}
