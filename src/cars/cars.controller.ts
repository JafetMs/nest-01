import {
    Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CarsService } from './cars.service.js';
import { CreateCarDto } from './dto/create-car.dto.js';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  getAllCars() {
    return this.carsService.findAll();
  }

  @Get(':id')
  getCarById(@Param('id', new ParseUUIDPipe({version:'4'})) id: string) {
    return this.carsService.findOneById(id);
  }

  @Post()
  @UsePipes( ValidationPipe )
  createCar( @Body() createCarDto:CreateCarDto){
    return {
        ok:true,
        method:'POST',
        createCarDto
    }
  }

  @Patch(':id')
    updateCar( 
        @Param('id') 
        @Body() body:any)
    {
        return body
    }
  
    @Delete(':id')
    deleteCar(
        @Param('id') 
        id: string) 
    {
        return {
            method: 'delete',
            id,
        }
    }
}
