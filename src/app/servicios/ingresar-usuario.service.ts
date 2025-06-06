import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore'; // Importa 'doc' y 'setDoc'
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { UsuarioIngresar } from '../ingresar-usuario/ingresar-usuario.component';

@Injectable({
  providedIn: 'root'
})
export class IngresarUsuarioService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async registrarUsuario(usuario: UsuarioIngresar) {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      usuario.email,
      usuario.password
    );

    const uid = userCredential.user.uid;
    const userType = usuario.userType; 
    

    let collectionPath: string;
    if (userType === 'administrador') {
      collectionPath = 'admin'; 
    } else {
      collectionPath = 'usuarios'; 
    }

   
    const targetCollectionRef = collection(this.firestore, collectionPath);

   
    const userDocRef = doc(targetCollectionRef, uid);


    await setDoc(userDocRef, {
      uid: uid,
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email,
      userType: userType, 
      fechaCreacion: new Date()
    });
  }
}

// import { Injectable } from '@angular/core';
// import { Firestore, collection, addDoc } from '@angular/fire/firestore';
// import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
// import { UsuarioIngresar } from '../ingresar-usuario/ingresar-usuario.component';

// @Injectable({
//   providedIn: 'root'
// })
// export class IngresarUsuarioService {
//   constructor(private firestore: Firestore, private auth: Auth) {}

//   async registrarUsuario(usuario: UsuarioIngresar) {
//     const userCredential = await createUserWithEmailAndPassword(
//       this.auth,
//       usuario.email,
//       usuario.password
//     );

//     const uid = userCredential.user.uid;

 
//     const usuariosRef = collection(this.firestore, 'usuarios');
//     await addDoc(usuariosRef, {
//       uid,
//       nombre: usuario.nombre,
//       email: usuario.email,
//       username: usuario.username,
//       fechaCreacion: new Date()
//     });
//   }
// }





