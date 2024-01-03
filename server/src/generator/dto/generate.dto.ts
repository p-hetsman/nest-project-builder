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

  @IsOptional()
  @IsBoolean()
  swagger: boolean;

  @IsOptional()
  @IsBoolean()
  postgres: boolean;

  @IsOptional()
  @IsBoolean()
  authJwt: boolean = false;

  @IsOptional()
  @IsBoolean()
  authGoogle: boolean = false;

  @IsOptional()
  @IsBoolean()
  authFacebook: boolean = false;

  @IsOptional()
  @IsBoolean()
  authOpenid: boolean = false;
}
