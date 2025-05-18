import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Producto } from '../producto';
import { ProductoService } from '../servicios/producto.service';

@Component({
  selector: 'app-un-producto',
  standalone:true,
  imports: [RouterModule],
  templateUrl: './un-producto.component.html',
  styleUrl: './un-producto.component.css'
})
export class UnProductoComponent {
   /*Mostrar productos individuales*/
   @Input() producto!:Producto;
   constructor(public heroeService:ProductoService,
              public activatedRoute:ActivatedRoute){
     this.activatedRoute.params.subscribe(params=>{
       this.producto=heroeService.getUnProducto(params['id']);
     })
   }
   /*Incrementar productos*/
  
 
   ngOnInit(): void {
   }
   cantidad: number = 1;
 
   incrementar(): void {
     this.cantidad++;
   }
 
   decrementar(): void {
     if (this.cantidad > 1) {
       this.cantidad--;
     }
   }
 
   actualizarCantidad(inputElement: HTMLInputElement): void {
     const nuevoValor = parseInt(inputElement.value, 10);
     if (!isNaN(nuevoValor) && nuevoValor >= 1) {
       this.cantidad = nuevoValor;
     } else {
       this.cantidad = 1;
       inputElement.value = '1'; 
     }
   }
}
