import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-global-navbar',
  templateUrl: './global-navbar.component.html',
  styleUrls: ['./global-navbar.component.css']
})
export class GlobalNavbarComponent implements OnInit {

  user: Observable<firebase.User>;
  authState;

  @Input() menuState;
  @Output()
  onHide: any = new EventEmitter();

  constructor(public authService: AuthService, private router: Router) {
    this.authState = this.authService.authState;
  }

  ngOnInit() {
    //
  }

  goToDashboard() {
    if (this.authService.authState) {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.router.navigate(['/start']);
    }
    this.menuState = false;
    this.onHide.emit(this.menuState);
  }

  collapseMenu() {
    this.menuState = false;
    this.onHide.emit(this.menuState);
  }

  logout() {
    this.authService.signOut();
  }

  toggleMenu() {
    this.menuState = !this.menuState;
    this.onHide.emit(this.menuState);
  }

}
