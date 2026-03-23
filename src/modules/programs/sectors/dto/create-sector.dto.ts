import { IsNotEmpty } from 'class-validator';

export class CreateSectorDto {
  @IsNotEmpty()
  name: string;
}
