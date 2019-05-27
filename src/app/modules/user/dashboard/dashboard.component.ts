import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faMagic, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { MDBModalService } from 'angular-bootstrap-md';

import { EditCardComponent } from '../edit-card/edit-card.component';
import { DeleteCardComponent } from '../delete-card/delete-card.component';
import { CustomDonationComponent } from '../custom-donation/custom-donation.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ChartService } from '../../../core/services/chart.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { ContentfulService } from '../../../core/services/contentful.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public loading = false;

  firstName = '';
  title = 'Dashboard | Allgive.org';
  showCharityManageView = false;
  showPaymentDetail = [false, false];
  donationOrgs = [];
  selectedOrg = null;
  choosedOrg = null;
  chartOptions: object;
  updateChart = false;
  totalDonation = 0;
  totalProjection = 0;
  charityLogos = [];
  payments = [];
  projectionPeriods = [
    'Daily Giving Total',
    'Weekly Giving Total',
    'Monthly Giving Total',
    'Quarterly Giving Total',
    '2019 Year-End-Projection'
  ];
  selectedProjection = '2019 Year-End-Projection';
  averageProjection = '$0.00';
  chartData;
  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl({value: '', disabled: true})
  });
  faMagic = faMagic;
  faSpinner = faSpinner;
  isSavingProfile = false;
  last4 = '';

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private contentfullService: ContentfulService,
    private chartService: ChartService,
    private modalService: NgbModal,
    private mdbModalService: MDBModalService,
    private paymentsService: PaymentsService
  ) { }

  ngOnInit() {

    window.scrollTo(0, 0);
    this.setTitle(this.title);
    this.chartOptions = this.chartService.getChartOptions([], this);

    this.init();
  }

  init() {

    this.loading = true;
    this.userService.getUserInfo().subscribe(async(res) => {

      if (res.contributions.length > 0) {
        this.getCharityLogos(res.contributions);
      }

      this.firstName = res.firstName;
      this.totalDonation = this.chartService.calTotalDonation(res.contributions);
      this.totalProjection = this.chartService.calTotalProjection(res.contributions);
      this.averageProjection = '$' + this.totalProjection + '.00';
      this.donationOrgs = this.chartService.processSeries(res.contributions);

      this.chartOptions = this.chartService.getChartOptions(this.donationOrgs, this);
      if (this.donationOrgs.length > 0) {
        this.updateChart = true;
      }

      this.payments = res.cards;

      this.profileForm.patchValue({
        firstName: res.firstName,
        lastName: res.lastName,
        email: res.email
      });
      this.chartData = res.contributions;
      this.loading = false;
    });
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  setProjectionPeriod(index) {
    this.selectedProjection = this.projectionPeriods[index];
    switch (index) {
      case 0:
        this.averageProjection = '~$' + (this.totalProjection / 365).toFixed(2) + '/day';
        break;
      case 1:
        this.averageProjection = '~$' + (this.totalProjection / 52).toFixed(2) + '/week';
        break;
      case 2:
        this.averageProjection = '~$' + (this.totalProjection / 12).toFixed(2) + '/month';
        break;
      case 3:
        this.averageProjection = '~$' + (this.totalProjection / 4).toFixed(2) + '/quarter';
        break;
      case 4:
        this.averageProjection = '$' + this.totalProjection + '.00';
        break;
      default:
        this.averageProjection = '';
        break;
    }
  }

  addCharity() {
    this.router.navigate(['/charities']);
  }

  getCharityLogos(data) {
    return new Promise(resolve => {
      this.chartService.getCharityLogo(data).subscribe(res => {
        this.charityLogos = [];
        for (let i = 0; i < res.length; ++i) {
          this.charityLogos.push(res[i].fields.logo.fields.file.url);
        }
        resolve();
      });
    });
  }

  setShowCharityManage(value, chartity= null) {
    this.showCharityManageView = value;

    if(chartity != null) {
      this.choosedOrg = {...chartity};
      this.userService.cards.forEach(card => {
        if (this.choosedOrg.cardId === card.id) {
          this.last4 = card.last4;
        }
      });
    }
  }

  cancelDonation() {
    if (confirm('Are you sure to cancel this donation?')) {
      this.updateChart = false;
      const subscription_id = this.choosedOrg.invoices[0].subscription;
      this.setShowCharityManage(false);
      this.loading = true;
      this.paymentsService.processCancelSubscription({subscription_id}).subscribe(res => {
        this.init();
      });
    }
  }

  updateSchedule() {
    const data = {
      donation: this.choosedOrg.amount * 100,
      frequency: this.choosedOrg.schedule,
      charity_name: this.choosedOrg.charityname,
      token: null,
      subscription_id: this.choosedOrg.invoices[0].subscription,
      customer: this.choosedOrg.invoices[0].customer
    };
    this.loading = true;
    this.paymentsService.processUpdateSubscription(data).subscribe((result) => {
      this.setShowCharityManage(false);
      this.init();
    });
  }

  selectDonate(amount, schedule) {
    this.choosedOrg.amount = amount;
    this.choosedOrg.daily = amount;
    this.choosedOrg.schedule = schedule;
  }

  openCustomDonationModal() {
    const modalRef = this.mdbModalService.show(CustomDonationComponent);
    modalRef.content.action.subscribe( (result: any) => {
      this.choosedOrg.daily = result.amount;
      this.choosedOrg.amount = result.amount;
      this.choosedOrg.schedule = result.schedule;
    });
  }

  togglePaymentDetail(index) {
    this.showPaymentDetail[index] = !this.showPaymentDetail[index];
  }

  endDate(month, year) {
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    const todayStr = mm + '/' + dd + '/' + yyyy;
    const endDate = month + '/30/' + year;

    const date1 = new Date(todayStr);
    const date2 = new Date(endDate);
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
  }

  editCard(card) {
    const modalRef = this.modalService.open(EditCardComponent, { centered: true });
    modalRef.componentInstance.card = card;
    modalRef.result.then(result => {
    }, reason => {
      if (reason === 'success') {
        this.init();
      }
    });
  }

  deleteCard(card) {
    const modalRef = this.modalService.open(DeleteCardComponent, { centered: true });
    modalRef.componentInstance.cards = this.payments;
    modalRef.componentInstance.selectedCard = card;
    modalRef.result.then(result => {
    }, reason => {
      if (reason === 'success') {
        this.init();
      }
    });
  }

  updateProfile() {
    this.isSavingProfile = true;
    const data = {
      uid: this.authService.authState.uid,
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName
    };
    this.userService.updateProfile(data).subscribe(res => {
      this.isSavingProfile = false;
      this.init();
    });
  }

}
