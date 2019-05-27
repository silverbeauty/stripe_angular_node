import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UserService } from './core/services/user.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  menuState = true;

  public constructor(
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService,
    ) { }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  onClickWrapper() {
    this.menuState = false;
    return true;
  }

  onHide($event) {
    this.menuState = $event;
    console.log('menu', this.menuState);
  }
}
