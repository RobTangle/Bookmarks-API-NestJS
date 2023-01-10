import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditBookmarkDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  link?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  keywords?: string[];
}
