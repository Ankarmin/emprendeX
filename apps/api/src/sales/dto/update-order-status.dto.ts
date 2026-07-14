import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../database/database.enums';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del pedido',
    enum: OrderStatus,
    enumName: 'OrderStatus',
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
