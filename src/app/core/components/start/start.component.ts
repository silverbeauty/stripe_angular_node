import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { MailChimpService } from '../../../core/services/mailchimp.service';
import { UserService } from '../../services/user.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  title = 'Get started | Allgive.org';
  invalid = false;
  errorMessage = '';
  success = false;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private mailchimpService: MailChimpService,
    private userService: UserService
  ) { }

  signupForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.email]
  });

  ngOnInit() {
    window.scrollTo(0, 0);
    this.setTitle(this.title);
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  onSubmit() {
    this.invalid = false;
    this.errorMessage = '';

    this.authService.emailSignUp(
      this.signupForm.value.firstName,
      this.signupForm.value.lastName,
      this.signupForm.value.email,
      '1234567'
    )
      .then((res) => {
        this.success = true;
        this.authService.signOut2();
        // this.router.navigate(['link-login']);
      })
      .catch(error => {
        this.invalid = true;
    });
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

}
