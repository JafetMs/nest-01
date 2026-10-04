import { v4 as uuid } from 'uuid';
import { Car } from '../../cars/interfaces/car.interface.js';

export const CARS_SEED: Car[] = [
  {
    id: uuid(),
    brand: 'Toyota',
    model: 'Corolla',
  },
  {
    id: uuid(),
    brand: 'Honda',
    model: 'Civic',
  },
  {
    id: uuid(),
    brand: 'Ford',
    model: 'Mustang',
  },
  {
    id: uuid(),
    brand: 'Nissan',
    model: 'Sentra',
  },
  {
    id: uuid(),
    brand: 'Mazda',
    model: 'Mazda 3',
  },
];
