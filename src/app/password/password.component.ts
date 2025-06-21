import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword, updatePassword } from '@angular/fire/auth';
import { collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [],
  templateUrl: './password.component.html',
  styleUrl: './password.component.css'
})
export class PasswordComponent {
  constructor(private firestore: Firestore, private auth: Auth){}
  formDesbloqueo = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    oldPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });


  async desbloquearCuenta() {
    // Obtener valores y tiparlos
    const email = this.formDesbloqueo.get('email')?.value;
    const oldPassword = this.formDesbloqueo.get('oldPassword')?.value;
    const newPassword = this.formDesbloqueo.get('newPassword')?.value;

    // Validar que no sean nulos o vacíos
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

      Swal.fire('Listo', 'Contraseña actualizada y cuenta desbloqueada', 'success');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        Swal.fire('Error', 'La contraseña anterior es incorrecta.', 'error');
      } else {
        Swal.fire('Error', 'No se pudo cambiar la contraseña.', 'error');
      }
    }
  }


}
