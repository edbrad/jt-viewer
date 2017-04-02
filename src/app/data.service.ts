import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import 'rxjs/Rx';

import { Job } from './jobs/job';

@Injectable()
export class DataService {

  constructor(private http: Http) { }

  apiUrlRoot: string = 'http://172.16.97.216:8000';     // Test API Server
  //apiUrlRoot: string = 'http://172.16.97.216:8000';   // Prod API Server

  apiTest() {
    //const url = 'http://172.16.97.216:8000/api/';
    const url = this.apiUrlRoot + '/api/';
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getStats(date: string) {
    //const url = 'http://172.16.97.216:8000/api/stats/?date=' + date;
    const url = this.apiUrlRoot + '/api/stats/?date=' + date;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getAJob(jobnum) {
    //const url = 'http://172.16.97.216:8000/api/jobnum-search?jobnum=' + jobnum;
    const url = this.apiUrlRoot + '/api/jobnum-search?jobnum=' + jobnum;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getJobs(jobnum) {
    //const url = 'http://172.16.97.216:8000/api/jobnum-search?jobnum=' + jobnum;
    const url = this.apiUrlRoot + '/api/jobnum-search?jobnum=' + jobnum;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());

  }

  getJobDetails(jobnum) {
    //const url = 'http://172.16.97.216:8000/api/jobdetails?jobnum=' + jobnum;
    const url = this.apiUrlRoot + '/api/jobdetails?jobnum=' + jobnum;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getJobsForClient(client) {
    //const url = 'http://172.16.97.216:8000/api/jobs-company?company=' + client;
    const url = this.apiUrlRoot + '/api/jobs-company?company=' + client;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getClients() {
    //const url = 'http://172.16.97.216:8000/api/companies';
    const url = this.apiUrlRoot + '/api/companies';
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

}
