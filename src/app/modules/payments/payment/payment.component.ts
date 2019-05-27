import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';

import { PaymentConfirmationComponent } from '../payment-confirmation/payment-confirmation.component';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { UserService } from '../../../core/services/user.service';
import { SubscriptionPaymentComponent } from '../subscription-payment/subscription-payment.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {

  charity;
  donation;
  cards;
  modals = [];

  error: string;
  name: string;
  email: string;
  authState;
  invalidCard = false;
  errorMessage = '';
  isNewCard = true;
  selectedCard = null;

  elements: Elements;
  card: StripeElement;
  isBack = false;
  donationElements;
  

  constructor(
    public modalRef: MDBModalRef,
    private modalService: MDBModalService,
    private auth: AuthService,
    private payments: PaymentsService,
    private stripeService: StripeService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.stripeService.elements()
      .subscribe(elements => {
        this.elements = elements;
        if (!this.card) {
          this.card = this.elements.create('card', {
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '40px',
                fontWeight: 300,
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '18px',
                '::placeholder': {
                  color: '#CFD7E0'
                }
              }
            }
          });
          this.card.mount('#card-element');
          this.authState = this.auth.authState;
        }
      });
    this.modals.push(this.modalRef);

    if(this.selectedCard == null || this.selectedCard == undefined) {
      this.isNewCard = true;
    }
  }

  closeAllModals() {
    console.log(this.modals);
    
    // for (let i = 0; i < this.modals.length; i++) {
    //   this.modals[i].hide();
    //   // const index = i;
    //   // setTimeout(() => {
    //   //   console.log(index);
    //   //   this.modals[index].hide();
    //   // }, 1000);
    // }

    // console.log("xxxxxxxxxxxxxx", this.modals);

    // setTimeout(() => {
    //   const elements: any = document.getElementsByTagName('mdb-modal-container');
    //   console.log(elements);
    //   for(let i = 0; i < elements.length; i++) {
    //     elements[i].style.display = 'none';
    //     elements[i].remove();
    //   }
    // }, 500);
    // this.modalService.hide(0);
    // this.modalRef.hide();
    // this.closeAll();

    this.modalRef.hide();
  }

  ngOnDestroy() {
    if(this.card !== undefined && this.card !== null) {
      this.card.unmount();
    }
  }

  onChangeCard(card) {
    if (card) {
      this.isNewCard = false;
      this.selectedCard = card;
    } else {
      this.isNewCard = true;
      this.selectedCard = null;
    }
  }

  back() {
    this.modalRef.hide();

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
          charity: this.charity,
          selectedCard: this.selectedCard,
          isNewCard: this.isNewCard,
          donationElements: this.donationElements
      }
    };
    this.modalService.show(SubscriptionPaymentComponent, modalOptions);
  }
  open() {
    this.invalidCard = false;
    this.errorMessage = '';
    if (this.isNewCard) {

      this.stripeService.createToken(this.card, {}).subscribe(async(result) => {
        if (result.token) {

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
                token: result.token,
                charity: this.charity,
                donation: this.donation,
                name: this.name,
                email: this.email,
                cards: this.cards,
                modals: this.modals,
                isNewCard: this.isNewCard,
                donationElements: this.donationElements
            }
          };
          await this.userService.getUserCards();
          this.modalService.show(PaymentConfirmationComponent, modalOptions);
          this.modalRef.hide();
        } else {
          this.invalidCard = true;
          this.errorMessage = result.error.message;
        }
      });
    } else {
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
            token: null,
            charity: this.charity,
            donation: this.donation,
            customer: this.selectedCard ? this.selectedCard.customer : null,
            name: this.name,
            email: this.email,
            modals: this.modals,
            cards: this.cards,
            selectedCard: this.selectedCard,
            isNewCard: this.isNewCard,
            donationElements: this.donationElements
        }
      };

      this.modalService.show(PaymentConfirmationComponent, modalOptions);
      this.modalRef.hide();
    }
  }
}
