import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable()
export class UserService {

  private apiUrl = environment.apiUrl;

  public cards: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {

    this.authService.authStateChange.subscribe(auth => {
      if(auth) {
        this.getUserCards();
      }
    });
  }

  getUserInfo(): Observable<any> {
    const endpoint = this.apiUrl + '/getUserInfo';
    const requestData = {
      uid: this.authService.authState.uid
    };
    return this.http.post(endpoint, requestData);
  }

  getUserCards(): Promise<any> {
    const endpoint = this.apiUrl + '/user-cards';
    const requestData = {
      email: this.authService.authState.email
    };
    return new Promise(resolve => {
      this.http.post(endpoint, requestData).subscribe( (cards: any[]) => {
        this.cards = cards;
        resolve(this.cards);
      });
    })
  }

  updateCard(data): Observable<any> {
    const endpoint = this.apiUrl + '/update-card';
    return this.http.post(endpoint, data);
  }

  deleteCard(data): Observable<any> {
    const endpoint = this.apiUrl + '/delete-card';
    return this.http.post(endpoint, data);
  }

  updateProfile(data): Observable<any> {
    const endpoint = this.apiUrl + '/update-profile';
    return this.http.post(endpoint, data);
  }
}
