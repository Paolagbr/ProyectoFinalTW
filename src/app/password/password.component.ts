import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, updatePassword } from '@angular/fire/auth';
import { collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReactiveFormsModule } from '@angular/forms'; // Importar ReactiveFormsModule
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { Router } from '@angular/router';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Añadir ReactiveFormsModule y CommonModule a imports
  templateUrl: './password.component.html',
  styleUrl: './password.component.css'
})
export class PasswordComponent {

  constructor(private firestore: Firestore, private auth: Auth, private router:Router) {}

  // Validador estático para comparar contraseñas
  static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')?.value;
    const repeated = group.get('passwordRepeted')?.value;
    return password === repeated ? null : { passwordsMismatch: true };
  }

  formDesbloqueo = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    oldPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$')
    ]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$')
    ]),
    passwordRepeted: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$')
    ]),
  }, { validators: PasswordComponent.passwordsMatchValidator }); 

  async desbloquearCuenta() {
    // Verificar si el formulario es válido antes de continuar
    if (this.formDesbloqueo.invalid) {
      Swal.fire('Error', 'Por favor, corrige los errores en el formulario.', 'error');
      return;
    }

    // Obtener valores y tiparlos
    const email = this.formDesbloqueo.get('email')?.value;
    const oldPassword = this.formDesbloqueo.get('oldPassword')?.value;
    const newPassword = this.formDesbloqueo.get('newPassword')?.value;

  
    if (!email || !oldPassword || !newPassword) {
      Swal.fire('Error', 'Por favor completa todos los campos.', 'error');
      return;
    }

    try {
      // 1. Verificar usuario bloqueado en Firestore
      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Swal.fire('Error', 'Correo no registrado.', 'error');
        return;
      }

      const userDoc = snapshot.docs[0];
      const data = userDoc.data();

      if (!data['bloqueado']) {
        Swal.fire('Info', 'Tu cuenta no está bloqueada.', 'info');
        return;
      }

      // 2. Intentar iniciar sesión con la contraseña actual
      const userCredential = await signInWithEmailAndPassword(this.auth, email, oldPassword);
      const user = userCredential.user;

      // 3. Actualizar contraseña
      await updatePassword(user, newPassword);

      // 4. Desbloquear en Firestore
      await updateDoc(doc(this.firestore, 'usuarios', userDoc.id), {
        intentosFallidos: 0,
        bloqueado: false
      });
      await signOut(this.auth);
      
      Swal.fire('Listo', 'Contraseña actualizada y cuenta desbloqueada', 'success');

      this.router.navigate(['/sesion']);

      this.formDesbloqueo.reset(); 
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        Swal.fire('Error', 'La contraseña anterior es incorrecta.', 'error');
      } else if (error.code === 'auth/user-not-found') {
        Swal.fire('Error', 'Usuario no encontrado. Verifica el correo electrónico.', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        Swal.fire('Error', 'Demasiados intentos fallidos. Intenta de nuevo más tarde.', 'error');
      } else {
        Swal.fire('Error', 'No se pudo cambiar la contraseña. Intenta de nuevo.', 'error');
      }
    }
  }
}