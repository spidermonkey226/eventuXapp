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
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ReportTicketComponent } from './report-ticket/report-ticket.component';
import { TicketReplayComponent } from './admin/ticket-replay/ticket-replay.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'signin', component: SigninComponent},
    { path: 'signup', component: SignupComponent},
    { path: 'addevent', component: AddEventComponent},
    { path: 'profile', component: ProfileComponent},
    { path: 'event-manager/:id', component:EventManagerComponent},
    { path: 'user-events', component:UserEventsComponent},
    { path: 'event-owner/:id', component:EventOwnerComponent},
    { path: 'report-ticket', component: ReportTicketComponent },
    { path: 'rsvp', loadComponent: () => import('./rsvp/rsvp.component').then(m => m.RsvpComponent) },
     { path: 'file-upload', component:FileUploadComponent},
    {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: 'users', component: UserEditorComponent },
      { path: 'users/:id', component: UserEditorComponent },
      { path: 'events', component: EventEditorComponent },
      { path: 'events/:id', component: EventEditorComponent },
      { path: 'tickets', component: TicketReplayComponent }, 
      { path: 'tickets/:id',component: TicketReplayComponent },
      { path: '', pathMatch: 'full', redirectTo: 'users' }
    ]
  },
    { path: '**', component: PageNotFoundComponent },
];




