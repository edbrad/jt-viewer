import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { DataService } from '../data.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {

  private subscription: any;    /** the Observable subscription to the routing Service */

  jobnum: String;
  jobs: any[] = [];
  jobFilter: any = { JobDescp: '' };
  spaces: string ='&nbsp;&nbsp';

  constructor(private ds: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    /** TRICK: wrap ngOnInit stuff in an Observable to force the init to run again while the Component is
     * still loaded (e.g. run a new search while still on the job results page/route)
     */
    this.route.params.subscribe((params: Params) => {

      /** get the given job number (full or partial) to be searched for from the incoming route parameters */
      this.subscription = this.route.params.subscribe(params => { this.jobnum = params['jobnum'] });
      //console.log('job: ' + this.jobnum);
      /** get all matching Jobsfrom the external REST API*/
      this.ds.getJobs(this.jobnum).subscribe((data => {
        this.jobs = data;
      }));

    });
  }

  getJobCount(){
    return this.jobs.length;
  }

}
