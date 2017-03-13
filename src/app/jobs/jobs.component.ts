import { Component, OnInit, AfterViewInit, ViewChildren } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Observable, Subscription } from 'rxjs/Rx';

import { ToasterModule, ToasterService, ToasterConfig, Toast } from 'angular2-toaster';

import { DataService } from '../data.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {

  @ViewChildren('input') vc;

  private subscription: any;    /** the Observable subscription to the routing Service */
  private toasterService: ToasterService;
  public config1 : ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-right'
  });

  jobnum: String;
  jobs: any[] = [];
  jobFilter: any = { JobDescp: '' };
  spaces: string ='&nbsp;&nbsp';

  busy: Subscription

  constructor(private ds: DataService, private route: ActivatedRoute, toasterService: ToasterService) {
    this.toasterService = toasterService;
   }

   ngAfterViewInit() {
        this.vc.first.nativeElement.focus();
    }

  ngOnInit() {
    /** TRICK: wrap ngOnInit stuff in an Observable to force the init to run again while the Component is
     * still loaded (e.g. run a new search while still on the job results page/route)
     */
    this.route.params.subscribe((params: Params) => {

      /** get the given job number (full or partial) to be searched for from the incoming route parameters */
      this.subscription = this.route.params.subscribe(params => { this.jobnum = params['jobnum'] });
      //console.log('job: ' + this.jobnum);
      /** get all matching Jobsfrom the external REST API*/
      this.busy = this.ds.getJobs(this.jobnum).subscribe((data => {
        this.jobs = data;

        var toast: Toast = {
          type: 'success',
          title: 'EMS Job Ticket Viewer',
          body: this.jobs.length + ' Jobs Loaded from Database!'
        };

        this.toasterService.pop(toast);
      }));

    });
  }

  getJobCount(){
    return this.jobs.length;
  }

}
