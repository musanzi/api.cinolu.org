import { ArrayNotEmpty, IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCoachDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  profile: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  expected_outputs: string[];

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
