import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SKIP_ALL_THROTTLERS } from '../common/throttling/throttler.constants';
import { GetReportsDto } from './dto/get-reports.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reportes')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'reportes', version: '1' })
@UseGuards(JwtAuthGuard)
@SkipThrottle(SKIP_ALL_THROTTLERS)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary: 'Resumen del negocio',
    description: 'Obtiene un resumen general del negocio.',
  })
  @ApiResponse({ status: 200, description: 'Resumen del negocio.' })
  @Get('overview')
  getOverview(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.reportsService.getOverview(currentUser.id);
  }

  @ApiOperation({
    summary: 'Reportes del negocio',
    description:
      'Devuelve datos agregados por pestaña en un rango de fechas. ' +
      'Pestañas: resumen, inventario, ventas, clientes, financiero, todos.',
  })
  @ApiResponse({ status: 200, description: 'Datos de la pestaña solicitada.' })
  @Get()
  getReports(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GetReportsDto,
  ) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.reportsService.getBusinessReports(currentUser.id, {
      tab: query.tab ?? 'resumen',
      fechaInicio: query.fechaInicio ?? firstDay.toISOString().slice(0, 10),
      fechaFin: query.fechaFin ?? lastDay.toISOString().slice(0, 10),
      stockBajoUmbral: query.stockBajoUmbral ?? 5,
    });
  }

  @ApiOperation({
    summary: 'KPIs del negocio',
    description:
      'Obtiene indicadores clave de rendimiento del negocio con ajuste de zona horaria.',
  })
  @ApiResponse({ status: 200, description: 'KPIs del negocio.' })
  @Get('kpis')
  getBusinessKpis(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('timezone') timezone = 'America/Lima',
  ) {
    return this.reportsService.getBusinessKpis(currentUser.id, timezone);
  }
}
