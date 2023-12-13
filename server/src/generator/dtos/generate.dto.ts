import { IsString, MaxLength, IsBoolean, IsOptional } from 'class-validator';

export class GenerateDto {
  @IsString()
  @MaxLength(50)
  projectName: string;

  @IsOptional()
  @IsBoolean()
  allExceptions: boolean;

  @IsOptional()
  @IsBoolean()
  logger: boolean;

  @IsOptional()
  @IsBoolean()
  validation: boolean;

  @IsOptional()
  @IsBoolean()
  cors: boolean;
}
