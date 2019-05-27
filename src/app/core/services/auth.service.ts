import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { Observable, Subject } from 'rxjs';
import { PaymentsService } from './payments.service';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';

@Injectable()
export class AuthService {

  stripeCustomer;
  apiUrl = environment.apiUrl;
  authState: any = null;
  authStateChange: Subject<any> = new Subject();

  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private router: Router,
    private db: AngularFireDatabase,
    private pmt: PaymentsService,
  ) {
    this.afAuth.authState.subscribe((auth) => {

      this.authState = auth;
      setTimeout(() => {
        this.authStateChange.next(this.authState);
      }, 1000);
    });
  }

  

  // Returns true if user is authenticated
  isAuthenticated(): boolean {
    return this.authState !== null;
  }

  // Returns current user data
  currentUser(): any {
    return this.isAuthenticated ? this.authState : null;
  }

  // Returns observable with current user data
  currentUserObservable(): any {
    return this.afAuth.authState;
  }

  // Returns current user UID
  currentUserId(): string {
    return this.isAuthenticated ? this.authState.uid : '';
  }

  currentUserDisplayName(): string {
    if (!this.authState) { return ''; } else { return this.authState['displayName'] || 'Current User'; }
  }

  currentDbUser(): any {
    const id = this.currentUserId();
    return this.db.list('/users', ref => ref.orderByChild('authId')).query.equalTo(id);
  }

  // Email & Password Auth //

  // Create Stripe customer
  createUser(data): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/users', data);
  }

  // Check if user exist already.
  checkUser(data): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/check-user', {email: data});
  }

  // Update user activity
  updateUserActivity(uid): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/update-activity', {uid: uid});
  }

  // Update user activity
  updateRecentActivity(uid): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/recent-activity', {uid: uid});
  }

  // Sign up
  emailSignUp(firstName: string, lastName: string, email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        const authUser = this.afAuth.auth.currentUser;
        const data = {
          uid: authUser.uid,
          email: authUser.email,
          firstName: firstName,
          lastName: lastName
        };
        // Insert new user to database.
        this.createUser(data).subscribe(result => {
          this.emailLinkLogin(authUser.email).then(res => {
            Promise.resolve(res);
          });
        }, err => {
          Promise.reject(err);
        });
      })
      .catch(error => Promise.reject(error));
  }

  // Log in with email
  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        if (user) {
          this.authState = user;
          this.router.navigate(['/charities']);
        }
      })
      .catch(error => Promise.reject(error));
  }

  // Reset password
  resetPassword(email: string) {
    const auth = firebase.auth();

    return auth.sendPasswordResetEmail(email)
      .then(() => console.log('email sent'))
      .catch((error) => console.log(error));
  }

  // Passwordless Login
  emailLinkLogin(email: string) {
    const actionCodeSettings = environment.actionCodeSettings;
    return this.afAuth.auth.sendSignInLinkToEmail(email, actionCodeSettings)
      .then((res) => {
        console.log('res', res);
        window.localStorage.setItem('emailForSignIn', email)
      })
      .catch(err => console.log(err));
  }

  confirmSignIn(url) {
    const email = window.localStorage.getItem('emailForSignIn');
    return new Promise((resolve, reject) => {
      if (this.afAuth.auth.isSignInWithEmailLink(url)) {
        return this.afAuth.auth.signInWithEmailLink(email, url)
          .then((res) => {
            // window.localStorage.removeItem('emailForSignIn');
            this.authState = res.user;
            this.router.navigate(['/charities']);
            this.updateUserActivity(res.user.uid).subscribe();
            resolve('success');
          })
          .catch(err => {
            reject(err);
          });
      } else {
        reject('invalid link');
      }
    });

  }

  // Sign out
  signOut(): void {
    this.afAuth.auth.signOut();
    this.router.navigate(['/']);
  }
  signOut2(): void {
    this.afAuth.auth.signOut();
  }

}
