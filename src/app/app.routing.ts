import { Routes, RouterModule } from '@angular/router';

import { JobsComponent } from './jobs/jobs.component';
import { ClientsComponent } from './clients/clients.component';

const APP_ROUTES: Routes = [
    { path: '', redirectTo: '/jobs', pathMatch: 'full'},
    { path: 'jobs', component: JobsComponent},
    { path: 'clients', component: ClientsComponent}
];

export const routing = RouterModule.forRoot(APP_ROUTES);
