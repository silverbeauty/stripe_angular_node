import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CharitiesCarouselComponent } from './charities-carousel/charities-carousel.component';
import { GlobalNavbarComponent } from './global-navbar/global-navbar.component';
import { GlobalFooterComponent } from './global-footer/global-footer.component';
import { MdToHtmlPipe } from './md-to-html.pipe';
import { ValuesPipe } from './values.pipe';
import { FeaturedCarouselComponent } from './featured-carousel/featured-carousel.component';
import { TestimonialCarouselComponent } from './testimonial-carousel/testimonial-carousel.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

const routes: Routes = [];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    MDBBootstrapModule.forRoot()
  ],
  declarations: [
    CharitiesCarouselComponent, GlobalNavbarComponent, GlobalFooterComponent,
    MdToHtmlPipe, FeaturedCarouselComponent, ValuesPipe, TestimonialCarouselComponent
  ],
  exports: [
    CharitiesCarouselComponent, FeaturedCarouselComponent, GlobalNavbarComponent,
    GlobalFooterComponent, MdToHtmlPipe, ValuesPipe, RouterModule, TestimonialCarouselComponent
  ]
})
export class SharedModule { }
