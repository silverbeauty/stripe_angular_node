import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  title = 'Contact Us | Allgive.org';

  constructor( private titleService: Title ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.setTitle(this.title);
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

}
