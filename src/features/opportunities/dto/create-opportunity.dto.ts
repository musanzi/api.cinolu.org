import { IsDateString, IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { OpportunityLanguage } from '../entities/opportunity.entity';

export class CreateOpportunityDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsDateString()
  due_date: string;

  @IsUrl()
  link: string;

  @IsEnum(OpportunityLanguage)
  language: OpportunityLanguage;
}
