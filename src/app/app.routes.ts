import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PatientRegisterComponent } from './features/patient/register/patient-register/patient-register.component';
import { PatientRegistrationGuard } from './core/guards/patient-registration.guard';
import { AppointmentsComponent } from './features/patient/appointments/appointments.component';
import { ProfileComponent } from './features/patient/profile/profile.component';
import { AboutComponent } from './features/about/about.component';
import { ServicesComponent } from './features/services/services.component';
import { ContactComponent } from './features/contact/contact.component';
import { DoctorsListComponent } from './features/admin/doctor-list/doctors-list.component';
import { DoctorAppointmentsComponent } from './features/doctors/appointments/appointment-list/doctor-appointments.component';
import { AppointmentFullDetailComponent } from './features/doctors/appointments/appointment-full-detail/appointment-full-detail.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { ServicesListComponent } from './features/admin/services/services-list.component';
import { NotificationsListComponent } from './features/notifications/notifications-list/notifications-list.component';
import { AppointmentsListComponent } from './features/admin/appointments-list/appointments-list.component';
import { PatientsListComponent } from './features/admin/patients-list/patients-list.component';
import { DoctorPatientsListComponent } from './features/doctors/patients-list/patients-list.component';
import { BillingOverviewComponent } from './features/doctors/billing-overview/billing-overview.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Homepage
    { path: 'about', component: AboutComponent }, // About page
    { path: 'services', component: ServicesComponent }, // Services page
    { path: 'contact', component: ContactComponent }, // Contact page
    { path: 'auth/login', component: LoginComponent }, // Login page
    { path: 'auth/register', component: RegisterComponent }, // Register page
    { 
        path: 'patient/register', 
        component: PatientRegisterComponent,
        canActivate: [AuthGuard, PatientRegistrationGuard]
    },
    { 
        path: 'dashboard', 
        component: DashboardComponent, 
        canActivate: [AuthGuard, PatientRegistrationGuard]
    },
    {
        path:'appointments',
        component: AppointmentsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin/doctors',
        component: DoctorsListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'doctor/appointments',
        component: DoctorAppointmentsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'doctor/appointments/:id',
        component: AppointmentFullDetailComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin/system-settings',
        component: ServicesListComponent,
    },
    {
        path: 'notifications',
        component: NotificationsListComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'record/patients',
        component: PatientsListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'doctor/patients',
        component: DoctorPatientsListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'record/appointments',
        component: AppointmentsListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'doctor/billing',
        component: BillingOverviewComponent,
        canActivate: [AuthGuard]
    },
    { path: '**', component: NotFoundComponent }, // Redirect invalid routes to home
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
