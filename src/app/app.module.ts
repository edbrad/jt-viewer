import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AgmCoreModule } from 'angular2-google-maps/core';
import { ChartModule } from 'angular2-chartjs';
import { DataTableModule } from 'angular2-datatable';
import { Ng2FilterPipeModule } from 'ng2-filter-pipe';
import { ToasterModule, ToasterService } from 'angular2-toaster';

import { AppComponent } from './app.component';
import { JobsComponent } from './jobs/jobs.component';
import { PatternsComponent } from './patterns/patterns.component';
import { DataService } from './data.service';
import { GeocodeService } from './geocode.service';
import { routing } from './app.routing';
import { ClientsComponent } from './clients/clients.component';
import { HeaderComponent } from './header.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { PatternDetailsComponent } from './pattern-details/pattern-details.component';
import { FooterComponent } from './footer.component';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddCommasPipe } from './add-commas.pipe';


@NgModule({
  declarations: [
    AppComponent,
    JobsComponent,
    PatternsComponent,
    ClientsComponent,
    HeaderComponent,
    JobDetailsComponent,
    PatternDetailsComponent,
    FooterComponent,
    ClientDetailsComponent,
    DashboardComponent,
    AddCommasPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyA-Kw90at5wMcQIom0j2vDZUptQO3cplkU'
    }),
    ChartModule,
    DataTableModule,
    Ng2FilterPipeModule,
    ToasterModule
  ],
  providers: [DataService, GeocodeService, ToasterService],
  bootstrap: [AppComponent]
})
export class AppModule { }
