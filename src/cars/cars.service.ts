import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CarsService {
  private cars = [
    { id: 1, brand: 'Honda', name: 'Toyota' },
    { id: 2, brand: 'Jeep', name: 'Cherokee' },
    { id: 3, brand: 'Honda', name: 'Civic' },
    { id: 4, brand: 'Lamborginni', name: 'Shark' },
  ];


  findAll(){
    return this.cars;
  }

  findOneById(id : number){

    const car = this.cars.find( car => car.id === id)
    if(!car) throw new NotFoundException(`Car with id: ${id} not found`)
    return  car;
  }
}
