import { Injectable, NotFoundException } from '@nestjs/common';

import { v4 as uuid } from 'uuid'

import { Car } from './interfaces/car.interface.js';
import { CreateCarDto, UpdateCarDto } from '../cars/dto/index.js';


@Injectable()
export class CarsService {
  private cars: Car[] = [
    { id: uuid(), brand: 'Honda', model: 'Toyota' },
    { id: uuid(), brand: 'Jeep', model: 'Cherokee' },
    { id: uuid(), brand: 'Honda', model: 'Civic' },
    { id: uuid(), brand: 'Lamborginni', model: 'Shark' },
  ];



  findAll(){
    return this.cars;
  }

  findOneById(id : string){

    const car = this.cars.find( car => car.id === id)
    if(!car) throw new NotFoundException(`Car with id: ${id} not found`)
    return  car;
  }


  create ( createCarDto: CreateCarDto) {
    
    const car: Car  ={
        id: uuid(),
        ...createCarDto
        // brand: createCarDto.brand,
        // model: createCarDto.model

    }

    this.cars.push(car)
     return {
      ok:true,
      msg: `car created with id : ${car.id}`
     }
  }

   update( id:string, updateCarDto: UpdateCarDto){

      let carDB = this.findOneById(id);

      this.cars =  this.cars.map( car =>{

        if ( car.id === id){

          carDB = {
            ...carDB,
            ...updateCarDto,
            id
          }
          return carDB
        }
        return car
      })
    
      return carDB;
   }

   delete( id: string) {
    const car = this.findOneById( id );

    this.cars = this.cars.filter(car => car.id !== id)

    return `Car with ${id} succesfully deleted`
   }
}
