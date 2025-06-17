import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  getAdditionalUserInfo,
  linkWithPopup
} from '@angular/fire/auth';
import {
  collection,
  getFirestore,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { UsuarioIngresar } from '../datos';
//import { UsuarioIngresar } from '../ingresar-usuario/ingresar-usuario.component';

@Injectable({
  providedIn: 'root'
})
export class InicioSesionService {

  public username: string | undefined;
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> = this._isAuthenticated.asObservable();

  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> = this._currentUser.asObservable();

  private _appUsername = new BehaviorSubject<string | null>(null);
  appUsername$: Observable<string | null> = this._appUsername.asObservable();

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user && user.email) {
        this._isAuthenticated.next(true);
        this._currentUser.next(user);

        try {
          const db = getFirestore();
          const usuariosRef = collection(db, 'usuarios');
          const q = query(usuariosRef, where('email', '==', user.email));
          const querySnap = await getDocs(q);

          if (!querySnap.empty) {
            const userData = querySnap.docs[0].data() as UsuarioIngresar;
            if (userData.username) {
              this._appUsername.next(userData.username);
            } else {
              await this.logOut();
              this._appUsername.next(null);
            }
          } else {
            await this.logOut();
            this._appUsername.next(null);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          await this.logOut();
          this._appUsername.next(null);
        }
      } else {
        this._isAuthenticated.next(false);
        this._currentUser.next(null);
        this._appUsername.next(null);
      }
    });
  }
  async logIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
  const user = userCredential.user;

  const isRegistered = await this.isUserRegistered(user.email || '');
  if (!isRegistered) {
    await this.logOut();
    throw new Error('Usuario no registrado en la base de datos');
  }


  const alreadyLinked = user.providerData.some(p => p.providerId === 'google.com');
  if (!alreadyLinked) {
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(user, provider);
      console.log('Cuenta de Google vinculada automáticamente.');
    } catch (error: any) {
      if (error.code === 'auth/credential-already-in-use') {
        console.warn('Esta cuenta de Google ya está vinculada a otro usuario.');
       
      } else {
        console.error('Error al vincular automáticamente con Google:', error);
      }
    }
  }

  return userCredential;
}


 async logInGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;
    const email = user.email;

    if (!email) {
      throw new Error('No se pudo obtener el correo del usuario');
    }

    const isRegistered = await this.isUserRegistered(email);

    if (!isRegistered) {
      await this.logOut();
      throw new Error('El correo no está registrado en la base de datos');
    }

    return result;

  } catch (error: any) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      const pendingCred = GoogleAuthProvider.credentialFromError(error);

      if (!email || !pendingCred) {
        throw new Error('No se pudo obtener el correo o credenciales para vincular cuentas');
      }

      const methods = await fetchSignInMethodsForEmail(this.auth, email);

      if (methods.includes('password')) {
        
        const password = prompt('Ya existe una cuenta con este correo. Ingresa tu contraseña para vincularla con Google:');

        if (!password) {
          throw new Error('Contraseña necesaria para vincular cuentas');
        }

        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
        await linkWithCredential(userCredential.user, pendingCred);
        alert('Cuentas vinculadas correctamente');
        return userCredential;

      } else {
        throw new Error(`Por favor inicia sesión usando el proveedor: ${methods[0]}`);
      }
    } else {
      throw error;
    }
  }
}


  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  async isUserRegistered(email: string): Promise<boolean> {
    const db = getFirestore();
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email));
    const querySnap = await getDocs(q);
    return !querySnap.empty;
  }

  async logOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw error;
    }
  }
}



