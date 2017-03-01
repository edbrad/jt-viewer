import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { JobsComponent } from './jobs/jobs.component';
import { PatternsComponent } from './patterns/patterns.component';
import { DataService } from './data.service';
import { routing } from './app.routing';
import { ClientsComponent } from './clients/clients.component';
import { HeaderComponent } from './header.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { PatternDetailsComponent } from './pattern-details/pattern-details.component';
import { FooterComponent } from './footer.component';
import { ClientDetailsComponent } from './client-details/client-details.component';

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
    ClientDetailsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
