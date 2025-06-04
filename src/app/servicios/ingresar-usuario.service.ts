import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { UsuarioIngresar } from '../ingresar-usuario/ingresar-usuario.component';

@Injectable({
  providedIn: 'root'
})
export class IngresarUsuarioService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async registrarUsuario(usuario: UsuarioIngresar) {
    // 1. Crear usuario en Firebase Authentication (contraseña segura)
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      usuario.email,
      usuario.password
    );

    const uid = userCredential.user.uid;

    // 2. Guardar datos adicionales en Firestore (sin contraseña)
    const usuariosRef = collection(this.firestore, 'usuarios');
    await addDoc(usuariosRef, {
      uid,
      nombre: usuario.nombre,
      email: usuario.email,
      fechaCreacion: new Date()
    });
  }
}




// import { Injectable } from '@angular/core';
// import { addDoc, collection, doc, Firestore, setDoc } from '@angular/fire/firestore';
// import * as bcrypt from 'bcryptjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class IngresarUsuarioService {
  
//   constructor(private firestore: Firestore) {}
//  //*********************************Encriptacion de Contraseña con el cliente de angular */
//   async registrarUsuario(form: any) {
//     const salt = bcrypt.genSaltSync(10);
//     const hashedPassword = bcrypt.hashSync(form.password, salt);

//     const usuariosRef = collection(this.firestore, 'usuarios');

//     await addDoc(usuariosRef, {
//       nombre: form.nombre,
//       email: form.email,
//       passwordHash: hashedPassword,
//       tipo: 'normal',
//       fechaCreacion: new Date()
//     });
//   }
  
  
//}

