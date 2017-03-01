import { Routes, RouterModule } from '@angular/router';

import { JobsComponent } from './jobs/jobs.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { ClientsComponent } from './clients/clients.component';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { PatternsComponent } from './patterns/patterns.component';
import { PatternDetailsComponent } from './pattern-details/pattern-details.component';

const APP_ROUTES: Routes = [
    { path: '', redirectTo: '/jobs', pathMatch: 'full'},
    { path: 'jobs', component: JobsComponent},
    { path: 'job-details', component: JobDetailsComponent},
    { path: 'clients', component: ClientsComponent},
    { path: 'client-details', component: ClientDetailsComponent},
    { path: 'patterns', component: PatternsComponent},
    { path: 'pattern-details', component: PatternDetailsComponent}
];

export const routing = RouterModule.forRoot(APP_ROUTES);
