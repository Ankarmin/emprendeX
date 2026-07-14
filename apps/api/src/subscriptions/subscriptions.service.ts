import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanPeriod, SubscriptionStatus } from '../database/database.enums';
import { PlanPrice } from '../plans/entities/plan-price.entity';
import { UsersService } from '../users/users.service';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(PlanPrice)
    private readonly planPricesRepository: Repository<PlanPrice>,
    private readonly usersService: UsersService,
  ) {}

  async upgradeToPro(userId: string) {
    const proPlanPrice = await this.planPricesRepository.findOne({
      where: {
        period: PlanPeriod.Monthly,
        isActive: true,
        plan: {
          name: 'Pro',
        },
      },
      relations: {
        plan: true,
      },
    });

    if (!proPlanPrice) {
      throw new BadRequestException(
        'El plan Pro no está disponible en este momento',
      );
    }

    const activeSubscription = await this.subscriptionsRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.Active,
      },
    });

    if (activeSubscription) {
      activeSubscription.status = SubscriptionStatus.Inactive;
      await this.subscriptionsRepository.save(activeSubscription);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() + 30);

    await this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({
        userId,
        planPriceId: proPlanPrice.planPriceId,
        startDate,
        endDate,
        status: SubscriptionStatus.Active,
      }),
    );

    const sessionState =
      await this.usersService.enableAllModulesForUser(userId);

    if (!sessionState) {
      throw new BadRequestException(
        'No se pudo cargar el estado de la sesión después del upgrade',
      );
    }

    return this.usersService.toPublicUser(sessionState);
  }

  async downgradeToBasic(userId: string) {
    const activeSubscription = await this.subscriptionsRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.Active,
      },
    });

    if (activeSubscription) {
      activeSubscription.status = SubscriptionStatus.Inactive;
      await this.subscriptionsRepository.save(activeSubscription);
    }

    const sessionState =
      await this.usersService.ensureDefaultModulesForUser(userId);

    if (!sessionState) {
      throw new BadRequestException(
        'No se pudo cargar el estado de la sesión después del downgrade',
      );
    }

    return this.usersService.toPublicUser(sessionState);
  }
}
