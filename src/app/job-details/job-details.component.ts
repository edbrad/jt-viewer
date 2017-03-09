import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';
import { Observable } from "rxjs/Observable";

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit, OnDestroy {

  private subscription: any;    /** the Observable subscription to the routing Service */

  jobPatterns: any[] = [];
  jobNumber: String;
  job: any;
  aJob: {} = {};
  totalQty: number;

  constructor(private route: ActivatedRoute, private ds: DataService) { }

  ngOnInit() {
    /** get the given job (number) to be displayed from the incoming route parameters */
    this.subscription = this.route.params.subscribe(params => {this.jobNumber = params['jobnum']});

    /** get all Client data from the external REST API then filter out the matching Client from
     * incoming route */
    this.ds.getAJob(this.jobNumber).subscribe((data => {
      this.job = data;
      //console.log('job: ' + JSON.stringify(this.job));
      this.aJob = this.job[0];

      this.ds.getJobDetails(this.jobNumber).subscribe((data => {
        this.jobPatterns = data;
        //console.log('job patterns: ' + JSON.stringify(this.jobPatterns));
        this.totalQty = 0;
        for (var i = 0; i < this.jobPatterns.length; i++) {
          this.totalQty += parseInt(this.jobPatterns[i].PackShip);
          this.totalQty += parseInt(this.jobPatterns[i].cbas);
          this.totalQty += parseInt(this.jobPatterns[i].cpre);
          this.totalQty += parseInt(this.jobPatterns[i].ccrt);
          this.totalQty += parseInt(this.jobPatterns[i].cwalk125);
          this.totalQty += parseInt(this.jobPatterns[i].csat);
          this.totalQty += parseInt(this.jobPatterns[i].cbasbar);
          this.totalQty += parseInt(this.jobPatterns[i].cdig3bar);
          this.totalQty += parseInt(this.jobPatterns[i].cdig5bar);
          this.totalQty += parseInt(this.jobPatterns[i].caadc);
          this.totalQty += parseInt(this.jobPatterns[i].cmaadc);
          this.totalQty += parseInt(this.jobPatterns[i].cbas3dig);
          this.totalQty += parseInt(this.jobPatterns[i].foreign);
          this.totalQty += parseInt(this.jobPatterns[i].canadian);
        }
      }));

    }));
  }

  /**
   * @function getPatternCount
   * @description get the number of Patterns found for the given Job
   * @returns {Number} the number of Patterns found
   */
  private getPatternCount(){
    //this.getTotalQtyForEachJob();
    return this.jobPatterns.length;
  }

  private numberWithCommas(x: number) {
    return x.toLocaleString();
}

  /**
   * @method ngOnDestroy
   * @description Component clean-up
   */
  ngOnDestroy(){
    /** dispose of subsription to prevent memory leak */
    this.subscription.unsubscribe();
  }
}
