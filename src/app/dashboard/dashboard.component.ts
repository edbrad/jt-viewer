import { Component, OnInit } from '@angular/core';

import { ToasterModule, ToasterService, ToasterConfig, Toast } from 'angular2-toaster';
import { LoadingPage } from '../loading-indicator';

import { DataService } from '../data.service';
import { Observable } from "rxjs/Observable";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends LoadingPage implements OnInit {

  private toasterService: ToasterService;
  public config1 : ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-right'
  });

  /** ChartJS parameters */
  type = 'line';
  data = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Mail Drop Volume for Last 6 Months",
        data: [65, 59, 80, 81, 56, 55]
      }
    ]
  };
  options = {
    responsive: true,
    maintainAspectRatio: false
  };

  stats: any = {};
  todaysJobs: any[] = [];

  /**
   * @constructor
   */
  constructor(toasterService: ToasterService, private ds: DataService) {
    super(true); // sets loading to true
    this.toasterService = toasterService;
   }

  /**
   * @method ngOnInit
   * @description Component initialization
   */
  ngOnInit() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var dateString: string = String(mm) + '/' + String(dd) + '/' + String(yyyy);
    /** get a stats from the external REST API */
    this.ds.getStats(dateString).subscribe((data => {
      this.stats = data;
      this.todaysJobs = this.stats.todaysJobs;
      this.ready(); // sets loading to false
    }));

    var toast: Toast = {
      type: 'success',
      title: 'EMS Job Ticket Viewer',
      body: 'Application Loaded!'
    };

    this.toasterService.pop(toast);
  }

  /**
   * @function addCommas
   * @description reformatts a number by adding colums for thousands deliniation
   * @param {number} intNum the number to add commas to
   * @returns {string} the formatted number with commas (US Style)
   */
  private addCommas(intNum: number) {
    return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
  }

}
