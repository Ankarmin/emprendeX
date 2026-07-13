import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { RlsContextService } from '../database/rls/rls-context.service';
import { OrderEntity } from '../orders/entities/order.entity';
import { UsersService } from '../users/users.service';

type CalendarEvent = {
  id: string;
  referenceCode: string;
  type: 'Pedido';
  title: string;
  customerFullName: string;
  deliveryMethod: string | null;
  total: string;
  status: string;
  paymentStatus: string | null;
  date: string;
  time: string;
};

@Injectable()
export class CalendarService {
  constructor(
    private readonly rlsContextService: RlsContextService,
    private readonly usersService: UsersService,
  ) {}

  async listEvents(userId: string) {
    return this.rlsContextService.runAsUser(userId, async (manager) => {
      const business = await this.usersService.findPrimaryBusinessByUserId(
        userId,
        manager,
      );

      if (!business) {
        return [];
      }

      const orders = await this.getOrdersForCalendar(
        manager,
        business.businessId,
      );

      const events: CalendarEvent[] = orders.map(
        (order): CalendarEvent => ({
          id: order.orderId,
          referenceCode: order.referenceCode,
          type: 'Pedido',
          title: order.referenceCode,
          customerFullName:
            `${order.quotation.customer.firstNames} ${order.quotation.customer.lastNames ?? ''}`.trim(),
          deliveryMethod: order.quotation.deliveryMethod,
          total: order.quotation.total,
          status: order.status,
          paymentStatus: order.payment?.status ?? null,
          date: order.quotation.deliveryDate.toISOString(),
          time: order.quotation.deliveryDate.toISOString(),
        }),
      );

      return events.sort((left, right) => left.date.localeCompare(right.date));
    });
  }

  private getOrdersForCalendar(manager: EntityManager, businessId: string) {
    return manager.getRepository(OrderEntity).find({
      where: { businessId },
      relations: {
        quotation: { customer: true },
        payment: true,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
