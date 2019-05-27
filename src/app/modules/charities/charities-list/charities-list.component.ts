import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EntryCollection, Entry } from 'contentful';

import { AuthService } from '../../../core/services/auth.service';
import { ContentfulService } from '../../../core/services/contentful.service';

@Component({
  selector: 'app-charities-list',
  templateUrl: './charities-list.component.html',
  styleUrls: ['./charities-list.component.css'],
})
export class CharitiesListComponent implements OnInit {

  charities: Entry<any>[] = [];
  filteredCharities: Entry<any>[] = [];
  categories: Entry<any>[] = [];
  activeCategory;
  featuredCharity;
  showAll = true;
  coverStyle: {};
  title = 'All Charities | Allgive.org';

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private contentfulService: ContentfulService) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.getAllCharities()
    .then(res => {
      this.coverStyle = {
        'background-image': 'url(' + this.featuredCharity.fields.coverImage.fields.file.url + ')'
      };
    });

    this.setTitle(this.title);

    this.contentfulService.getCategories()
      .then(res => {
        this.categories = res;
      });

    this.activeCategory = 'Category';
  }

  getCategory(category) {
    return this.contentfulService.getCategory(category)
      .then(res => this.activeCategory = res.fields.categoryName);
  }

  getAllCharities() {
    return this.contentfulService.getCharities()
      .then(res => {
        this.charities = res;
        this.filteredCharities = res;
        this.showAll = true;
        this.activeCategory = 'Category';
        this.featuredCharity = res[Math.floor(Math.random() * res.length)];
      });
  }

  getCharitiesByCategory(category) {
    return this.contentfulService.getCharitiesByCategory(category)
      .then(res => {
        this.charities = res;
        this.filteredCharities = res;
        this.showAll = false;
        this.getCategory(category);
      });
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  onSearchCharity(searchValue: string) {
    const charities = this.charities.filter(function (charity) {
      return charity.fields.charityName.toLowerCase().includes(searchValue);
    });
    this.filteredCharities = charities;
  }
}
