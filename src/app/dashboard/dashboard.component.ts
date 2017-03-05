import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

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
  constructor() { }

  /**
   * @method ngOnInit
   * @description Component initialization
   */
  ngOnInit() {
  }

}
