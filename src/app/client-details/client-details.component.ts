import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Client } from './client';
import { DataService } from '../data.service';
import { GeocodeService } from '../geocode.service';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent implements OnInit, OnDestroy {

  private subscription: any;

  clientName: string = '';
  clientDetail: Client = {
    Comp: '',
    Contact: '',
    Add1: '',
    Add2: '',
    City: '',
    state: '',
    zip: '',
    phone: ''
  };
  clients: any[] = [];
  contacts: any[] = [];

  address: string = '';
  geocodeData: {} = {};
  geocodeStatus: string;
  lat: number = 41.6867322;
  lng: number = -87.81182009999999;
  mapZoom: number = 12;

  constructor(private route: ActivatedRoute, private ds: DataService, private gc: GeocodeService) { }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {this.clientName = params['client']});

    // get Client data
    this.ds.getClients().subscribe((data => {
      this.clients = data;
      this.clientDetail = this.clients.find(client => client.Comp === this.clientName);
      //console.log("client: " + JSON.stringify(this.clientDetail));
      for (var i = 0; i < this.clients.length ; i++){
        if (this.clients[i].Comp === this.clientName){
          this.contacts.push(this.clients[i]);
        }
      }
      // get Geocode coordinate data from address for map rendering
      if(this.clientDetail.Add2 == null){
        this.address = this.clientDetail.Add1 + ' '
                      + this.clientDetail.City + ' '
                      + this.clientDetail.state + ' '
                      + this.clientDetail.zip;
      } else{
        this.address = this.clientDetail.Add1 + ' '
                      + this.clientDetail.Add2 + ' '
                      + this.clientDetail.City + ' '
                      + this.clientDetail.state + ' '
                      + this.clientDetail.zip;
      }
      //console.log("address: " + this.address);
      this.gc.getGeoData(this.address).subscribe((data => {
        this.geocodeData = data;
        this.geocodeStatus = data.status;
        //console.log("geocode: " + JSON.stringify(this.geocodeData));
        //console.log("status: " + this.geocodeStatus);
        if(this.geocodeStatus == 'OK'){
          //console.log("lat: " + data.results[0].geometry.location.lat);
          //console.log("lng: " + data.results[0].geometry.location.lng);
          this.lat = data.results[0].geometry.location.lat;
          this.lng = data.results[0].geometry.location.lng;
        }
      }));
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

  // reformat zip code data into US Zip Code format/style
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
