import { IsDateString, IsUUID } from '@nestjs/class-validator';

export class CreateProjectUserDto {
  @IsDateString()
  startDate!: Date;

  @IsDateString()
  endDate!: Date;

  @IsUUID(4)
  projectId!: string; //au format uuidv4

  @IsUUID(4)
  userId!: string; //au format uuidv4
}
