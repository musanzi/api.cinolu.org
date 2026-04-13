import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { OpportunityLanguage } from '../entities/opportunity.entity';

export class FilterOpportunitiesDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEnum(OpportunityLanguage)
  language?: OpportunityLanguage;
}
