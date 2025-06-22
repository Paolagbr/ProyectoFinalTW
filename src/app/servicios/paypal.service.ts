import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
constructor(private firestore: Firestore) {}

  agregarDato(collectionName: string, data: any): Promise<any> {
    const coleccionRef = collection(this.firestore, collectionName);
    return addDoc(coleccionRef, data);
  }

}
