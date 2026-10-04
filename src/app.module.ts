import { Module } from '@nestjs/common';
import { CarsModule } from './cars/cars.module.js';
import { BrandsModule } from './brands/brands.module.js';
import { SeedModule } from './seed/seed.module.js';


@Module({
  imports: [ CarsModule, BrandsModule, SeedModule ],
  controllers: [],
  providers: [],
})
export class AppModule {}
