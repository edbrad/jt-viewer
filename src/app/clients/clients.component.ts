import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { DataService } from '../data.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  clients: any[] = [];          /** the entire list of Clients */
  distinctClients: any[] = [];  /** clients to be displayed (db has duplicates) */

  /**
   * @constructor
   * @description Create a Clients Component
   * @param {DataService} ds - the injected data service -
   *                           used to fetch data from the external REST API
   */
  constructor(private ds: DataService) { }

  /**
   * @method ngOnInit
   * @description Component initialization
   */
  ngOnInit() {
    /** get distinct Client data - MS ACCESS data is duplicated for each Contact */
    this.ds.getClients().subscribe((data => {
      this.clients = data;
      this.distinctClients = this.removeArrayDuplicates(this.clients, "Comp");
    }));
  }

  /**
   * @function removeArrayDuplicates
   * @description remove duplicates from an object array based on a given property
   * @param {Array} arr - the Array to be processed
   * @param {String} prop - the Property of the object used to detremine a duplicate
   * @returns {Array} the array without duplicates
   */
  private removeArrayDuplicates(arr, prop) {
    return arr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
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
}
