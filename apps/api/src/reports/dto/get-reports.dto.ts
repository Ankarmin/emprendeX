import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

const VALID_TABS = [
  'resumen',
  'inventario',
  'ventas',
  'clientes',
  'financiero',
  'todos',
] as const;

export class GetReportsDto {
  @ApiPropertyOptional({ enum: VALID_TABS, default: 'resumen' })
  @IsOptional()
  @IsIn(VALID_TABS)
  tab?: string;

  @ApiPropertyOptional({ example: '2026-07-01' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ example: '2026-07-31' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  @Max(100)
  stockBajoUmbral?: number;
}
