import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { UsuarioIngresar } from '../datos';

@Injectable({
  providedIn: 'root'
})
export class IngresarUsuarioService {

  constructor(private firestore: Firestore, private auth: Auth) {}

  async isUsernameTaken(username: string): Promise<boolean> {
    const usuariosRef = collection(this.firestore, "usuarios");
    const qUsuarios = query(usuariosRef, where("username", "==", username));
    const usuariosSnapshot = await getDocs(qUsuarios);

    return !usuariosSnapshot.empty;
  }

  async registrarUsuario(usuario: UsuarioIngresar): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        usuario.email,
        usuario.password
      );

      const uid = userCredential.user.uid;

      const usuariosRef = collection(this.firestore, 'usuarios');
      const userDocRef = doc(usuariosRef, uid);

      await setDoc(userDocRef, {
        uid: uid,
        nombre: usuario.nombre,
        username: usuario.username,
        email: usuario.email,
        userType: usuario.userType, // todavía puedes usar esto para saber si es admin
        fechaCreacion: new Date()
      });

    } catch (error) {
      console.error('Error al registrar usuario en el servicio:', error);
      throw error;
    }
  }
}


// import { Injectable } from '@angular/core';
// import { Firestore, collection, doc, setDoc, query, where, getDocs } from '@angular/fire/firestore';
// import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
// import { UsuarioIngresar } from '../datos';


// @Injectable({
//   providedIn: 'root'
// })
// export class IngresarUsuarioService {

//   constructor(private firestore: Firestore, private auth: Auth) {}

//   async isUsernameTaken(username: string): Promise<boolean> {
//     const usuariosRef = collection(this.firestore, "usuarios");
//     const qUsuarios = query(usuariosRef, where("username", "==", username));
//     const usuariosSnapshot = await getDocs(qUsuarios);

//     if (!usuariosSnapshot.empty) {
//       return true;
//     }

//     const adminRef = collection(this.firestore, "admin");
//     const qAdmin = query(adminRef, where("username", "==", username));
//     const adminSnapshot = await getDocs(qAdmin);

//     if (!adminSnapshot.empty) {
//       return true;
//     }

//     return false;
//   }

//   async registrarUsuario(usuario: UsuarioIngresar): Promise<void> {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         this.auth,
//         usuario.email,
//         usuario.password
//       );

//       const uid = userCredential.user.uid;
//       const userType = usuario.userType;

//       let collectionPath: string;
//       if (userType === 'administrador') {
//         collectionPath = 'admin';
//       } else {
//         collectionPath = 'usuarios';
//       }

//       const targetCollectionRef = collection(this.firestore, collectionPath);
//       const userDocRef = doc(targetCollectionRef, uid);

//       await setDoc(userDocRef, {
//         uid: uid,
//         nombre: usuario.nombre,
//         username: usuario.username,
//         email: usuario.email,
//         userType: userType,
//         fechaCreacion: new Date()
//       });
      

//     } catch (error) {
//       console.error('Error al registrar usuario en el servicio:', error);
//       throw error;
//     }
//   }
  
// }

