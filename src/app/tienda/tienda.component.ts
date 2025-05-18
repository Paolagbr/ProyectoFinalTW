import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BusquedaComponent } from '../busqueda/busqueda.component';
import { Producto } from '../producto';
import { ProductoService } from '../servicios/producto.service';

@Component({
  selector: 'app-tienda',
  standalone:true,
  imports: [RouterModule,BusquedaComponent],
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.css'
})
export class TiendaComponent implements OnInit, OnDestroy {
  TiendaProductos: Producto[] = [];
  ProductosFiltrados: Producto[] = [];

  constructor(public miservicio: ProductoService) {

  }
  ngOnInit(): void {
    this.TiendaProductos= this.miservicio.getProducto();
    this.ProductosFiltrados = this.TiendaProductos;
    document.body.classList.add('tienda-background');
  }
  actualizarProducto(prod: Producto[]) {
    this.ProductosFiltrados = prod;  
  }

  ngOnDestroy(): void {
    document.body.classList.remove('tienda-background');
  }
}
