import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, ParamMap, NavigationEnd } from '@angular/router';
import { Entry } from 'contentful';

import { ContentfulService } from '../../../core/services/contentful.service';

@Component({
  selector: 'app-pages',
  templateUrl: './page-wrapper.component.html',
  styleUrls: ['./page-wrapper.component.css']
})
export class PageWrapperComponent implements OnInit {

    page;
    title: string;
    pageTitle: string;
    pageContent;

  constructor(
    private titleService: Title,
    private contentfulService: ContentfulService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.router.events.subscribe((event) => {
      window.scrollTo(0, 0);
        if (event instanceof NavigationEnd) {
          this.ngOnInit();
          window.scroll(0, 0);
        }
      });
  }

  ngOnInit() {
    const pageSlug = this.route.snapshot.paramMap.get('slug');

    this.contentfulService.getTextOnlyPage(pageSlug)
    .then(res => {
        this.page = res;
        this.title = this.page.fields.pageTitle + ' | Allgive.org';
        this.setTitle(this.title);
        this.pageTitle = this.page.fieldspageTitle;
        this.pageContent = this.page.fields.pageContent;
    });
  }

  public setTitle( newTitle: string ) {
    this.titleService.setTitle( newTitle );
  }

}
