import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl, FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn, Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule],
  templateUrl: './registro-usuarios.component.html',
  styleUrl: './registro-usuarios.component.css'
})
export class RegistroUsuariosComponent implements OnInit, OnDestroy {
  private passwordPattern: RegExp = /^(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9_]{8,}$/;
  public form = new FormGroup(
    {
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]*$')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]),
      passwordRepeted: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]),
    },
    { validators: [RegistroUsuariosComponent.passwordsMatchValidator] }
  );
  
  submittedData: any = null;

  ngOnInit(): void {
    
    document.body.classList.add('usuarios-background');
  }
  
  static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repeated = group.get('passwordRepeted')?.value;
    return password === repeated ? null : { passwordsMismatch: true };
  }
  get nombre() { return this.form.get('nombre'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get passwordRepeted() { return this.form.get('passwordRepeted'); }


  onSubmit() {
    if (this.form.valid) {
      this.submittedData = this.form.value;
      this.form.reset();
      Swal.fire({
        icon: 'success',
        title: '¡Formulario Válido!',
        text: 'Datos enviados correctamente.',
        confirmButtonText: 'Ok'
      });
    }
  }
  ngOnDestroy(): void {
    document.body.classList.remove('usuarios-background');
  }

}
