import { Module } from '@nestjs/common';
import { CarsModule } from './cars/cars.module.js';


@Module({
  imports: [ CarsModule ],
  controllers: [],
  providers: [],
})
export class AppModule {}
