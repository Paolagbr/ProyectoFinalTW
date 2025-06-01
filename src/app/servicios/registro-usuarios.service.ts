import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistroUsuariosService {

   constructor(private firestore:Firestore) { 
    }
  /*addPlace(place: userInfo){
      const placeRef=collection(this.firestore, 'citas')
      return addDoc(placeRef, place);
  }*/
  }