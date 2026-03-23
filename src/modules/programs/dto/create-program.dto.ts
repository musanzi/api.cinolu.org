import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  category: string;

  @IsUUID()
  sector: string;
}
