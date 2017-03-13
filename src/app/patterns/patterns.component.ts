import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-patterns',
  templateUrl: './patterns.component.html',
  styleUrls: ['./patterns.component.css']
})
export class PatternsComponent implements OnInit {

  private subscription: any;    /** the Observable subscription to the routing Service */

  pattern: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    /** get the given job (number) to be displayed from the incoming route parameters */
    this.subscription = this.route.params.subscribe(params => { this.pattern = params['pattern'] });
  }

}
