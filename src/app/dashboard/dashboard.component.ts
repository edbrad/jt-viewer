import { Component, OnInit } from '@angular/core';

import { ToasterModule, ToasterService, ToasterConfig, Toast } from 'angular2-toaster';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

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

  /**
   * @constructor
   */
  constructor(toasterService: ToasterService) {
    this.toasterService = toasterService;
   }

  /**
   * @method ngOnInit
   * @description Component initialization
   */
  ngOnInit() {
    var toast: Toast = {
      type: 'success',
      title: 'EMS Job Ticket Viewer',
      body: 'Application Loaded!'
    };

    this.toasterService.pop(toast);
  }

}
