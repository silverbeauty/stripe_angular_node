import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-testimonial-carousel',
  templateUrl: './testimonial-carousel.component.html',
  styleUrls: ['./testimonial-carousel.component.scss']
})
export class TestimonialCarouselComponent implements OnInit {

  testimonials = [];

  constructor(config: NgbCarouselConfig) {
    // config.interval = 10000;
  }

  ngOnInit() {
    this.testimonials = [{
      content: 'I’ve always wanted to give to charity, but I’ve never felt like I was in a position to do it financially. With AllGive I can give a little every day and it adds up super fast.',
      name: 'Thomas Mackey ',
      address: 'Tucson, Arizona',
      image: '../assets/images/testimonials/Man1.jpg'
    }, {
      content: 'My dad had diabetes so I’ve always liked the idea of giving to find a cure. AllGive makes it easy to give, and even easier to see where and how much I’ve given. You’ve got to try it!',
      name: 'James Seymore',
      address: 'Providence, Rhode Island',
      image: '../assets/images/testimonials/Man2.jpg'
    }, {
      content: 'I honestly don’t have any great excuse why I’ve stopped donating to my favorite charities. When a friend told me about AllGive though, I realized there really isn’t any excuse at all to not contribute. AllGive is so easy. I literally don’t even miss the daily donations I’ve been making. Everybody can afford a few dollars a day!',
      name: 'Katie Dunhill',
      address: 'Atlanta, Georgia',
      image: '../assets/images/testimonials/Woman2.jpg'
    }];
  }

}
