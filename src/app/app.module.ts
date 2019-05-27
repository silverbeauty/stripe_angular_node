import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpClientJsonpModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { NgxStripeModule } from 'ngx-stripe';
import { NgxLoadingModule } from 'ngx-loading';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { environment } from '../environments/environment';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { PagesModule } from './modules/pages/pages.module';
import { CharitiesModule } from './modules/charities/charities.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuthModule } from './modules/auth/auth.module';

// Guards
import { AuthGuard } from './core/guards/auth.guard';

// Services
import { AuthService } from './core/services/auth.service';
import { UserService } from './core/services/user.service';
import { ChartService } from './core/services/chart.service';
import { TitleService } from './core/services/title.service';
import { PaymentsService } from './core/services/payments.service';
import { MailChimpService } from './core/services/mailchimp.service';
import { ContentfulService } from './core/services/contentful.service';
import { ContentfulPreviewService } from './core/services/contentful-preview.service';

// Components
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { MainComponent } from './core/components/main/main.component';
import { FaqsComponent } from './core/components/faqs/faqs.component';
import { ContactComponent } from './core/components/contact/contact.component';
import { SubscriptionPaymentComponent } from './modules/payments/subscription-payment/subscription-payment.component';
import { PaymentComponent } from './modules/payments/payment/payment.component';
import { PaymentConfirmationComponent } from './modules/payments/payment-confirmation/payment-confirmation.component';
import { PasswordlessAuthComponent } from './modules/auth/passwordless-auth/passwordless-auth.component';
import { StartComponent } from './core/components/start/start.component';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    MainComponent,
    FaqsComponent,
    ContactComponent,
    PasswordlessAuthComponent,
    StartComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    NgxStripeModule.forRoot(environment.stripeKey),
    NgbModule,
    SharedModule,
    CharitiesModule,
    UserModule,
    AuthModule,
    PaymentsModule,
    PagesModule,
    AppRoutingModule,
    NgxLoadingModule.forRoot({}),
    FontAwesomeModule,
    MDBBootstrapModule.forRoot()
  ],
  providers: [
    HttpClient, Title, ContentfulService, ContentfulPreviewService, TitleService,
    AuthService, AuthGuard, PaymentsService, MailChimpService, UserService, ChartService ],
  bootstrap: [ AppComponent ],
  entryComponents: []
})
export class AppModule { }
