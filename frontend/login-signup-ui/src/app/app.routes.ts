import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { AdminApprovalComponent } from './pages/admin-approval/admin-approval';

export const routes: Routes = [

  {
    path: '',
    component: LoginComponent
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'signup',
    component: SignupComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent
  },

  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent
  },

  {
    path: 'admin-approval',
    component: AdminApprovalComponent
  }

];