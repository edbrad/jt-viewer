import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';

import { DataService } from '../data.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {

  constructor(private ds: DataService) { }

  ngOnInit() {

  }

}
