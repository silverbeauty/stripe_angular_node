import { Component, Input, OnInit } from '@angular/core';
import { Entry } from 'contentful';
import { map } from 'rxjs/operators';

import { ContentfulService } from '../../core/services/contentful.service';

@Component({
  selector: 'app-charities-carousel',
  templateUrl: './charities-carousel.component.html',
  styleUrls: ['./charities-carousel.component.scss']
})
export class CharitiesCarouselComponent implements OnInit {

  @Input() carouselType: string;
  charities: Entry<any>[];
  cardCount;
  slides: any = [[]];

  constructor(
    private contentfulService: ContentfulService
  ) {}

  chunk(arr, chunkSize) {
    const R = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize) {
      R.push(arr.slice(i, i + chunkSize));
    }
    return R;
  }

  ngOnInit() {
    if (window.screen.width < 576) {
      this.cardCount = 3;
    } else {
      this.cardCount = 6;
    }
    return this.contentfulService.getCharities()
      .then(res => {
        this.charities = res;
        this.slides = this.chunk(this.charities, this.cardCount);
      });
  }
}
