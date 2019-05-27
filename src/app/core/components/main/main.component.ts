import { Component, OnInit, setTestabilityGetter } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Entry } from 'contentful';

import { ContentfulService } from '../../../core/services/contentful.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  title = 'Small Sacrifice, Big Difference | Allgive.org';
  charities: Entry<any>[] = [];
  carouselType = 'Available Charities';

  constructor(
    private titleService: Title,
    private contentfulService: ContentfulService
  ) {

  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.contentfulService.getCharities()
      .then(res => {
        this.charities = res;
        this.setTitle(this.title);
      }
    );
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

}
