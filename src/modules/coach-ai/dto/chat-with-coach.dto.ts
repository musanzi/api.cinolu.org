import { IsNotEmpty, IsString } from 'class-validator';

export class ChatWithCoachDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
