import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";


export class UpdateCarDto {

    @IsString()
    @IsUUID()
    @IsOptional()
    readonly id? : string;

    @IsOptional()
    @IsString()
    readonly brand?: string;
    
    @IsOptional()
    @IsString()
    @MinLength(3)
    readonly model?: string;

}3