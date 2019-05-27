import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faMagic, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-passwordless-auth',
  templateUrl: './passwordless-auth.component.html',
  styleUrls: ['./passwordless-auth.component.css']
})
export class PasswordlessAuthComponent implements OnInit {

  public loading = false;
  public isInvalidLink = false;
  public sendingLink = false;
  invalidUser = false;
  faMagic = faMagic;
  faSpinner = faSpinner;
  title = 'Log In | Allgive.org';
  emailSent = false;
  loginForm = this.fb.group({
    email: ['', Validators.email]
  });

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
   ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.setTitle(this.title);
    const url = this.router.url;
    if (url !== '/link-login') {
      this.confirmSignIn(url);
    }
    this.router.events.subscribe(val => {
      if (this.authService.authState && val.constructor.name === 'NavigationEnd') {
        const uid = this.authService.authState.uid;
        this.authService.updateRecentActivity(uid).subscribe();
      }
    });
  }

  sendEmailLink() {
    this.sendingLink = true;
    this.emailSent = false;
    this.invalidUser = false;
    this.authService.checkUser(this.loginForm.value.email).subscribe(user => {
      if (user) {
        const actionCodeSettings = environment.actionCodeSettings;
        this.authService.emailLinkLogin(this.loginForm.value.email)
          .then((res) => {
            this.emailSent = true;
            this.sendingLink = false;
            this.invalidUser = false;
          });
      } else {
        this.sendingLink = false;
        this.invalidUser = true;
      }
    });
  }

  confirmSignIn(url) {
    this.loading = true;
    this.authService.confirmSignIn(url)
      .then(res => { this.loading = false; },
            err => {
              this.loading = false;
              this.isInvalidLink = true;
            });
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
