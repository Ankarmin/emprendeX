import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { SKIP_ALL_THROTTLERS } from '../common/throttling/throttler.constants';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Suscripciones')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'subscriptions', version: '1' })
@UseGuards(JwtAuthGuard)
@SkipThrottle(SKIP_ALL_THROTTLERS)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({
    summary: 'Actualizar a plan Pro',
    description:
      'Cambia la suscripción del usuario autenticado al plan Pro y desbloquea los módulos premium.',
  })
  @ApiResponse({ status: 200, description: 'Upgrade exitoso.' })
  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  upgrade(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.subscriptionsService.upgradeToPro(currentUser.id);
  }

  @ApiOperation({
    summary: 'Volver a plan Básico',
    description:
      'Finaliza la suscripción Pro y restaura los módulos básicos del usuario.',
  })
  @ApiResponse({ status: 200, description: 'Downgrade exitoso.' })
  @Post('downgrade')
  @HttpCode(HttpStatus.OK)
  downgrade(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.subscriptionsService.downgradeToBasic(currentUser.id);
  }
}
