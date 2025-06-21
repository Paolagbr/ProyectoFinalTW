import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import { Observable, throwError} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map} from "rxjs/operators";
 
@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private siteKey = '6LeJA2ErAAAAAHg_RsMM_MF-aQt3Nfz97H5p8bfk'; 

  execute(): Promise<string> {
    return new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(this.siteKey, { action: 'submit' }).then(
          (token: string) => resolve(token),
          (err: any) => reject(err)
        );
      });
    });
  }
  // constructor(private http: HttpClient) {
  // }

  // getTokenClientModule(token: string): Observable<any> {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type':  'application/json',
  //     })
  //   };
  //     return this.http.post<any>( 'http://0.0.0.0:5000/api/v1/verificar/' + token +'/', httpOptions)
  //       .pipe(
  //         map((response) => response),
  //         catchError((err) => {
  //           console.log('error caught in service')
  //           console.error(err);
  //           return throwError(err);
  //         })
  //       );
  // }
  
}