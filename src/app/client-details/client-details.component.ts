import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent implements OnInit, OnDestroy {

  client: string = null;
  clientDetail: {} = {};
  clients: any[] = [];
  contacts: any[] = [];
  private subscription: any;

  constructor(private route: ActivatedRoute, private ds: DataService) { }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {this.client = params['client']});

    // get Client data
    this.ds.getClients().subscribe((data => {
      this.clients = data;
      this.clientDetail = this.clients.find(client => client.Comp === this.client);
      //console.log("client: " + JSON.stringify(this.clientDetail));
      for (var i = 0; i < this.clients.length ; i++){
        if (this.clients[i].Comp === this.client){
          this.contacts.push(this.clients[i]);
        }
      }
    }));
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

  formatUsZipCode(zip) {
    if (!zip) {
      return zip;
    }
    if (zip.toString().length === 9) {
      return zip.toString().slice(0, 5) + "-" + zip.toString().slice(5);
    } else if (zip.toString().length === 5) {
      return zip.toString();
    } else {
      return zip;
    }
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
