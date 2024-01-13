import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsDateString()
  date!: Date;

  @IsOptional()
  @IsString()
  eventDescription?: string;

  @IsEnum(['RemoteWork', 'PaidLeave'])
  @IsString()
  eventType!: 'RemoteWork' | 'PaidLeave';
}
