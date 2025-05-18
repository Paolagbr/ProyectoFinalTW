import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-formulario-reactivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-reactivo.component.html',
  styleUrl: './formulario-reactivo.component.css'
})
export class FormularioReactivoComponent {
  formulario: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.formulario = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      number: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  guardarDatos() {
    if (this.formulario.valid) {
      const datos = this.formulario.value;
      localStorage.setItem('registroUsuario', JSON.stringify(datos));
      this.formulario.reset();
  
      Swal.fire({
        title: "¡Registro exitoso!",
        text: "Tus datos han sido guardados correctamente",
        imageUrl: "../img/spa3.png",
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: "Custom image"
      }).then(() => {
        this.router.navigate(['/inicio']);
      });
  
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Completa todos los campos",
      });
    }
  }
  
  
}
