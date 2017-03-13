import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';

@Component({
  selector: 'app-pattern-details',
  templateUrl: './pattern-details.component.html',
  styleUrls: ['./pattern-details.component.css']
})
export class PatternDetailsComponent implements OnInit {

  private subscription: any;    /** the Observable subscription to the routing Service */

  pattern: string;
  jobnum: string;
  patterns: any[] = [];
  aPattern: any = {};
  totalQty: number;

  constructor(private route: ActivatedRoute, private ds: DataService) { }

  ngOnInit() {

    /** get the given job (number) to be displayed from the incoming route parameters */
    this.subscription = this.route.params.subscribe(params => {
      this.pattern = params['pattern'];
      this.jobnum = params['jobnum'];
    });

    /** get pattern information from the REST API */
    this.ds.getJobDetails(this.jobnum).subscribe((data => {
      this.patterns = data;
      this.aPattern = this.patterns.find(pattern => (pattern.Jobnum === this.jobnum) && (pattern.Jobpat === this.pattern));
      //console.log('pattern: ' + JSON.stringify(this.aPattern));
      this.totalQty = 0;
      this.totalQty += parseInt(this.aPattern.PackShip);
      this.totalQty += parseInt(this.aPattern.cbas);
      this.totalQty += parseInt(this.aPattern.cpre);
      this.totalQty += parseInt(this.aPattern.ccrt);
      this.totalQty += parseInt(this.aPattern.cwalk125);
      this.totalQty += parseInt(this.aPattern.csat);
      this.totalQty += parseInt(this.aPattern.cbasbar);
      this.totalQty += parseInt(this.aPattern.cdig3bar);
      this.totalQty += parseInt(this.aPattern.cdig5bar);
      this.totalQty += parseInt(this.aPattern.caadc);
      this.totalQty += parseInt(this.aPattern.cmaadc);
      this.totalQty += parseInt(this.aPattern.cbas3dig);
      this.totalQty += parseInt(this.aPattern.foreign);
      this.totalQty += parseInt(this.aPattern.canadian);
      //console.log('total: ' + this.totalQty);
    }));
  }

}
