import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { DataService } from '../data.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  clients: any[] = [];
  filteredClients: any[] = [];

  constructor(private ds: DataService) { }

  ngOnInit() {
    // get Client data
    this.ds.getClients().subscribe((data => {
      this.clients = data;
      this.filteredClients = this.removeArrayDuplicates(this.clients, "Comp");
      //console.log(JSON.stringify("filtered clients: " + this.filteredClients));
    }));
  }

  // remove duplicates from an object array based on a given property
  removeArrayDuplicates(arr, prop) {
    return arr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  // reformat phone data into US Phone Number format/style
  formatUsPhone(phone) {
    var phoneTest = new RegExp(/^((\+1)|1)? ?\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})( ?(ext\.? ?|x)(\d*))?$/);
    if (phone != null) {
      phone = phone.trim();
      var results = phoneTest.exec(phone);
      if (results !== null && results.length > 8) {

        return "(" + results[3] + ") " + results[4] + "-" + results[5] + (typeof results[8] !== "undefined" ? " x" + results[8] : "");
      }
      else {
        return phone;
      }
    } else {
      return phone;
    }
  }
}
