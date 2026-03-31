import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

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
}
