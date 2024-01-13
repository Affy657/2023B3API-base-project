import { IsDateString, IsUUID } from '@nestjs/class-validator';

export class CreateProjectUserDto {
  @IsDateString()
  startDate!: Date;

  @IsDateString()
  endDate!: Date;

  @IsUUID(4)
  projectId!: string;

  @IsUUID(4)
  userId!: string;
}
