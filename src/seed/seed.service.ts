import { Injectable } from '@nestjs/common';
import { CARS_SEED } from './data/cars.seed.js';
import { BRANDS_SEED } from './data/brands.seed.js';
import { BrandsService } from '../brands/brands.service.js';
import { CarsService } from '../cars/cars.service.js';


@Injectable()
export class SeedService {

  constructor(
    private readonly carsService  : CarsService,
    private readonly brandsService: BrandsService
  ) {
    
  }

  pupulateDB() {
    
    this.carsService.fillCarsWithSeedData( CARS_SEED);
    this.brandsService.fillBrandsWithSeedData( BRANDS_SEED)
    return 'Seed executed succesfully'
  }

}
