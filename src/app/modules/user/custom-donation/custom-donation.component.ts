import { Component, OnInit } from '@angular/core';
import { MDBModalRef } from 'angular-bootstrap-md';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-custom-donation',
  templateUrl: './custom-donation.component.html',
  styleUrls: ['./custom-donation.component.scss']
})
export class CustomDonationComponent implements OnInit {

  action: Subject<any> = new Subject();
  donationAmount = 10;
  donationSchedule = 'week';

  constructor(
    public modalRef: MDBModalRef
  ) { }

  ngOnInit() {
  }

  next() {
    const data = {
      amount: this.donationAmount,
      schedule: this.donationSchedule
    }
    this.modalRef.hide();
    this.action.next(data);
  }

}
