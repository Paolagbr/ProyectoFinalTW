import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Producto } from '../producto';

@Component({
  selector: 'app-busqueda',
  standalone:true,
  imports: [FormsModule],
  templateUrl: './busqueda.component.html',
  styleUrl: './busqueda.component.css'
})
export class BusquedaComponent {
  @Input() producto:  Producto[] = [];  
  @Output() filteredProd = new EventEmitter<Producto[]>(); 
  
  searchTerm: string = '';  

  filterProd() {
    if (this.searchTerm) { 
      const filtered = this.producto.filter(producto =>
        producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) 
        
      );
      this.filteredProd.emit(filtered);
    } else {
      this.filteredProd.emit(this.producto); 
    }
  }
}
