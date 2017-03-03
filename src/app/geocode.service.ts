import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import 'rxjs/Rx';

@Injectable()
export class GeocodeService {

  constructor(private http: Http) { }

  getGeoData(address: string){
    const apiKey = 'AIzaSyA-Kw90at5wMcQIom0j2vDZUptQO3cplkU';
    const url = 'https://maps.google.com/maps/api/geocode/json?address='
                + address
                + '&sensor=false '
                + '&key=' + apiKey;
    //console.log(url);
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON object
    return this.http.get(url)
      .map((response: Response) => response.json());
  }
}

