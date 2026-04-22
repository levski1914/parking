import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateParkingDto {
  @IsString()
  @IsNotEmpty()
  cityId: string;

  @IsEnum(['PRIVATE', 'MUNICIPAL'])
  parkingType: 'PRIVATE' | 'MUNICIPAL';

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  priceText: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  approxCapacity?: number;
}
