import { Routes,RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AddEventComponent } from './add-event/add-event.component';
import { ProfileComponent } from './profile/profile.component';
import { EventManagerComponent } from './event-manger/event-manger.component';
import { UserEventsComponent } from './user-events/user-events.component';
import { EventOwnerComponent } from './event-owner/event-owner.component';
import { AdminComponent } from './admin/admin.component';
import { UserEditorComponent } from './admin/user-editor/user-editor.component';
import { EventEditorComponent } from './admin/event-editor/event-editor.component';
import { FileUploadComponent } from './invited-event/file-upload/file-upload.component';
import { ReportTicketComponent } from './report-ticket/report-ticket.component';
import { TicketReplayComponent } from './admin/ticket-replay/ticket-replay.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { PaymentComponent } from './payment/payment.component';
import { MyInvitationsComponent } from './my-invitations/my-invitations.component';
import { InvitedEventComponent } from './invited-event/invited-event.component';
import { InvitedEventDetailsComponent } from './invited-event/invited-event-details/invited-event-details.component';
import { InvitedEventReportComponent } from './invited-event/invited-event-report/invited-event-report.component';
import { TicketConversationComponent } from './admin/ticket-conversation/ticket-conversation.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { EventOwnerResolver } from './event-owner/event-owner.resolver';
import { EventOwnerGuestsComponent } from './event-owner/event-owner.guests/event-owner.guests.component';
import { EventOwnerFilesComponent } from './event-owner/event-owner.files/event-owner.files.component';
import { EventOwnerReportsComponent } from './event-owner/event-owner.reports/event-owner.reports.component';


export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'signin', component: SigninComponent},
    { path: 'signup', component: SignupComponent},
    { path: 'addevent', component: AddEventComponent},
    { path: 'profile', component: ProfileComponent},
    { path: 'event-manager/:id', component:EventManagerComponent},
    { path: 'user-events', component:UserEventsComponent},
   
    { path: 'report-ticket', component: ReportTicketComponent },
    { path: 'subscribe', component: SubscribeComponent},
    { path: 'payment', component: PaymentComponent},
    { path: "my-invitations", component :MyInvitationsComponent},
    { path: "forgot-password", component: ForgotPasswordComponent},
    { path: "reset-password", component: ResetPasswordComponent},
    { path: 'rsvp', loadComponent: () => import('./rsvp/rsvp.component').then(m => m.RsvpComponent) },

     {
      path: 'event-owner/:id',
      component: EventOwnerComponent,             // this is now the layout
      resolve: { bootstrap: EventOwnerResolver }, // triggers store.bootstrap(id)
      children: [
        { path: '', pathMatch: 'full', redirectTo: 'guests' },
        { path: 'guests',  component: EventOwnerGuestsComponent },
        { path: 'files', component: EventOwnerFilesComponent },
        { path: 'reports', component: EventOwnerReportsComponent },
      ],
    },
    {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: 'users', component: UserEditorComponent },
      { path: 'users/:id', component: UserEditorComponent },
      { path: 'events', component: EventEditorComponent },
      { path: 'events/:id', component: EventEditorComponent },
      { path: 'tickets', component: TicketReplayComponent }, 
      { path: 'tickets/:id',component: TicketConversationComponent },
      { path: '', pathMatch: 'full', redirectTo: 'users' }
    ]
  },
  {
     path: 'invited-event/:id',
  component: InvitedEventComponent,
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'details' }, 
    { path: 'details', component: InvitedEventDetailsComponent },
    { path: 'upload', component:FileUploadComponent },
    { path: 'report', component: InvitedEventReportComponent } 
  ]
  },
    { path: '**', component: PageNotFoundComponent },
];




