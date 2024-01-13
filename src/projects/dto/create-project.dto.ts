import { IsUUID, Length } from 'class-validator';

export class CreateProjectDto {
  @Length(3)
  name!: string;

  @IsUUID(4)
  referringEmployeeId!: string;
}
