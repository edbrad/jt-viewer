import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { JobsComponent } from './jobs/jobs.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { ClientsComponent } from './clients/clients.component';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { PatternsComponent } from './patterns/patterns.component';
import { PatternDetailsComponent } from './pattern-details/pattern-details.component';

const APP_ROUTES: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    { path: 'dashboard', component: DashboardComponent},
    { path: 'jobs/:jobnum', component: JobsComponent},
    { path: 'job-details/:jobnum', component: JobDetailsComponent},
    { path: 'clients', component: ClientsComponent},
    { path: 'client-details/:client', component: ClientDetailsComponent},
    { path: 'patterns', component: PatternsComponent},
    { path: 'pattern-details/:jobnum/:pattern', component: PatternDetailsComponent}
];

export const routing = RouterModule.forRoot(APP_ROUTES);
