import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';
import { Entry } from 'contentful';

import { AuthService } from '../../../core/services/auth.service';
import { ContentfulService } from '../../../core/services/contentful.service';
import { ContentfulPreviewService } from '../../../core/services/contentful-preview.service';
import { SubscriptionPaymentComponent } from '../../payments/subscription-payment/subscription-payment.component';
import { UserService } from '../../../core/services/user.service';
import { ChangeSubscriptionComponent } from '../../payments/change-subscription/change-subscription.component';

@Component({
  selector: 'app-charity-details',
  templateUrl: './charity-details.component.html',
  styleUrls: ['./charity-details.component.scss']
})
export class CharityDetailsComponent implements OnInit {

  charity: Entry<any>;
  carouselType: String = 'Related Organizations';
  coverStyle: {};
  logoStyle: {};
  title: string;
  charityName = '';
  charityCategory = '';
  modalRef: MDBModalRef;
  isDonate = false;
  contributions: any[] = [];
  choosedOrg: any;
  initialized = false;
  modals = [];

  constructor(
    private titleService: Title,
    private contentfulService: ContentfulService,
    private contenfulPreviewService: ContentfulPreviewService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: MDBModalService,
    private auth: AuthService,
    private userService: UserService,
  ) {
    // const subscriber = this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     this.ngOnInit();
    //     //window.scroll(0, 0);
    //     const body: any = document.getElementsByTagName("body")[0];
    //     body.scrollTop = 0;
    //   }
    //   subscriber.unsubscribe();
    // });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    const handler = setInterval(() => {
      if (this.auth.authState) {
        clearInterval(handler);
        const subscriber = this.userService.getUserInfo().subscribe(res => {
          this.contributions = res.contributions;
          this.checkIsDonate();
          subscriber.unsubscribe();
          this.initialized = true;
        });
      }
    }, 1000);
    const pathSegment = this.route.snapshot.pathFromRoot[1].url[0].path;
    const charityId = this.route.snapshot.paramMap.get('slug');
    if (pathSegment === 'preview') {
      this.contenfulPreviewService.previewCharityDetail(charityId)
        .then(res => {

          alert('preview');
          this.charity = res;
          this.charityName = this.charity.fields.charityName;
          this.charityCategory = this.charity.fields.category.fields.categoryName;
          this.title = 'Preview | ' + this.charity.fields.charityName + ' | Allgive.org';
          this.setTitle(this.title);
          this.coverStyle = {
            'background-image': 'url(' + this.charity.fields.coverImage.fields.file.url + ')',
            'background-position': 'center 20%',
            'background-size': 'cover',
            'margin-bottom': '7vw'
          };
          this.logoStyle = {
            'background-image': 'url(' + this.charity.fields.logo.fields.file.url + ')',
            'background-size': 'cover',
            'position': 'absolute',
            'overflow': 'hidden',
            'width': '10vw',
            'height': '10vw',
            'bottom': '-5vw',
            'left': '0',
            'right': '0',
            'margin': 'auto',
            'text-indent': '-10rem'
          };

          this.checkIsDonate();
        });
    } else {
      this.contentfulService.getCharityDetail(charityId)
        .then(res => {

          if(res == undefined) return this.router.navigate(['not-find-page']);

          this.charity = res;
          this.charityName = this.charity.fields.charityName;
          this.charityCategory = this.charity.fields.category.fields.categoryName;
          this.title = this.charity.fields.charityName + ' | Allgive.org';
          this.setTitle(this.title);
          this.coverStyle = {
            'background-image': 'url(' + this.charity.fields.coverImage.fields.file.url + ')',
            'background-position': 'center 20%',
            'background-size': 'cover',
            'margin-bottom': '7vw'
          };
          this.logoStyle = {
            'background-image': 'url(' + this.charity.fields.logo.fields.file.url + ')',
            'background-size': 'cover',
            'position': 'absolute',
            'overflow': 'hidden',
            'width': '10vw',
            'height': '10vw',
            'bottom': '-5vw',
            'left': '0',
            'right': '0',
            'margin': 'auto',
            'text-indent': '-10rem'
          };
          this.checkIsDonate();
        });
    }
  }

  checkIsDonate() {
    this.isDonate = true;
    if(this.auth.isAuthenticated()) {
        this.contributions.forEach(contribution => {
        if(contribution.charityname === this.charityName) {
          this.isDonate = false;
          this.choosedOrg = contribution;
        }
      });
    } else {
      this.isDonate = true;
      this.initialized = true;
    }
  }

  public setTitle( newTitle: string ) {
    this.titleService.setTitle( newTitle );
  }

  open() {
    if (this.auth.authState) {
      const modalOptions = {
        backdrop: true,
        keyboard: true,
        focus: true,
        show: false,
        ignoreBackdropClick: false,
        class: '',
        containerClass: '',
        animated: true,
        modals: this.modals,
        data: {
            charity: this.charity
        }
      };
      this.modalService.show(SubscriptionPaymentComponent, modalOptions);
    } else {
      this.router.navigate(['/start']);
    }
  }

  closeAllModals() {
    for (let i = 0; i < this.modals.length; ++i) {
      this.modals[i].hide();
    }
    setTimeout(() => {
      const elements: any = document.getElementsByTagName('mdb-modal-container');
      for(let i = 0; i < elements.length; i++) {
        elements[0].style.display = 'none';
      }
    }, 500);
  }

  openManager() {
    if (this.auth.authState) {
      const modalOptions = {
        backdrop: true,
        keyboard: true,
        focus: true,
        show: false,
        ignoreBackdropClick: false,
        class: '',
        containerClass: '',
        animated: true,
        data: {
            charity: this.charity,
            choosedOrg: this.choosedOrg,
            callback: () => {
              this.ngOnInit();
            }
        }
      };
      this.modalService.show(ChangeSubscriptionComponent, modalOptions);
    } else {
      this.router.navigate(['/start']);
    }
  }
}
