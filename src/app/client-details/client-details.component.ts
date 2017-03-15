import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Client } from './client';
import { DataService } from '../data.service';
import { GeocodeService } from '../geocode.service';
import { Observable } from "rxjs/Observable";

import { LoadingPage } from '../loading-indicator';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent extends LoadingPage implements OnInit, OnDestroy {

  private subscription: any;    /** the Observable subscription to the routing Service */

  clientName: string = '';      /** the selected Client name from list */
  clientDetail: Client = {      /** the selected Client details */
    Comp: '',
    Contact: '',
    Add1: '',
    Add2: '',
    City: '',
    state: '',
    zip: '',
    phone: ''
  };
  clients: any[] = [];          /** the entire list of clients */
  contacts: any[] = [];         /** all the Contacts for the given Client */
  clientJobs: any[] = [];       /** the jobs for the given Client */
  jobPatterns: any[] = [];      /** all of the patterns for the given Client's jobs */
  wrkPatterns: any[] = [];
  wrkJobTotal: number;
  wrkClientTotal: number;

  address: string = '';         /** the address of the given Client */
  geocodeData: {} = {};         /** the returned Geocode data from Geocode Serice */
  geocodeStatus: string;        /** the returned Google Maps API Status from the Geocode Service */

  /** Google Maps API parameters - default settings */
  lat: number = 41.6867322;
  lng: number = -87.81182009999999;
  mapZoom: number = 12;

  /**
   * @constructor
   * @description Create a Client Detail Component
   * @param {ActivatedRoute} route - the injected route - used to get the souce route parameter (client)
   * @param {DataService} ds - the injected data service - used to get data from the REST API (pyACCESS)
   * @param {GeocodeService} gc - the injected Geocoding service - used to get Lat & Lng for a given address
   */
  constructor(private route: ActivatedRoute, private ds: DataService, private gc: GeocodeService) {
     super(true); // sets loading to true
  }

  /**
   * @method ngOnInit
   * @description Component initialization
   */
  ngOnInit() {
    /** get the given client (name) to be displayed from the incoming route parameters */
    this.subscription = this.route.params.subscribe(params => {this.clientName = params['client']});

    /** get all Client data from the external REST API then filter out the matching Client from
     * incoming route */
    this.ds.getClients().subscribe((data => {
      this.clients = data;
      /** get the first client, for detail display, that matches the given client
       * (duplicates exist in db for each contact) */
      this.clientDetail = this.clients.find(client => client.Comp === this.clientName);

      /** collect all the Contacts for the given Client (exist in 1 or more Client entries) */
      for (var i = 0; i < this.clients.length ; i++){
        if (this.clients[i].Comp === this.clientName){
          this.contacts.push(this.clients[i]);
        }
      }

      /** get Geocode coordinate data from address for map rendering */
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
      this.gc.getGeoData(this.address).subscribe((data => {
        this.geocodeData = data;
        this.geocodeStatus = data.status;
        if(this.geocodeStatus == 'OK'){
          this.lat = data.results[0].geometry.location.lat;
          this.lng = data.results[0].geometry.location.lng;
        }
      }));

      /** get all Jobs for the given Client from the external REST API */
      this.standby();
      this.ds.getJobsForClient(this.clientName).subscribe((data => {
        this.clientJobs = data;
        this.ready(); // sets loading to false
      }));
    }));
  }

  /**
   * @function formatUsPhone
   * @description Reformat phone data into US Phone Number format/style
   * @param {String} phone - phone number to be reformatted
   * @returns {String} the reformatted phone number
   */
  private formatUsPhone(phone) {
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

  /**
   * @function formatUsZipCode
   * @description reformat zip code data into US Zip Code format/style
   * @param {String} zip - the Zip Code to be reformatted
   * @returns {String} the reformatted Zip Code
   */
  private formatUsZipCode(zip) {
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

  /**
   * @function getJobCount
   * @description get the number of Jobs found for the given Client
   * @returns {Number} the number of Jobs found
   */
  private getJobCount(){
    //this.getTotalQtyForEachJob();
    return this.clientJobs.length;
  }

  /**
   * @method ngOnDestroy
   * @description Component clean-up
   */
  ngOnDestroy(){
    /** dispose of subsription to prevent memory leak */
    this.subscription.unsubscribe();
  }
}
