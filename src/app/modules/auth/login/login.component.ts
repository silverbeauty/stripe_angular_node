import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { Observable } from 'rxjs';
import { User } from 'firebase';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user;
  title = 'Log In | Allgive.org';
  failedLogin = false;
  faSpinner = faSpinner;
  submitted = false;
  errorMessage = '';

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private location: Location
  ) { }

  loginForm = this.fb.group({
    email: ['', Validators.email],
    password: ['', Validators.required]
  });

  ngOnInit() {
    window.scrollTo(0, 0);
    if (this.authService.authState) {
      this.router.navigate(['/charities']);
    }

    this.setTitle(this.title);
  }

  onSubmit() {
    this.failedLogin = false;
    this.submitted = true;
    this.authService.emailLogin(this.loginForm.value.email, this.loginForm.value.password)
      .then(
        res => {
          this.submitted = false;
        },
        err => {
          this.failedLogin = true;
          this.submitted = false;
          this.errorMessage = err.message;
      });
  }

  goPasswordlessLogin() {
    this.router.navigate(['/link-login']);
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

}
