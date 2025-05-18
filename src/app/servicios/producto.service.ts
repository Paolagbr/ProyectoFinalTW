import { Injectable } from '@angular/core';
import { Producto } from '../producto';
import { PRODUCTOS } from '../TiendaProductos';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private producto:Producto[]=PRODUCTOS;
  constructor() { }
  getProducto():Producto[]{
    return this.producto;
  }
  getUnProducto(position:number):Producto{
    return this.producto[position];
  }
}
