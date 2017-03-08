import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {


  jobnum: String = '';

  constructor( private router: Router) { }

  ngOnInit() {

  }

  jobSearch(){
    //alert("You Clicked Search");
    this.router.navigateByUrl('/jobs/' + this.jobnum);

  }

}
