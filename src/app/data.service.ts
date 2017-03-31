import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import 'rxjs/Rx';

import { Job } from './jobs/job';

@Injectable()
export class DataService {

  constructor(private http: Http) { }

  apiTest(){
    const url = 'http://172.16.97.216:8000/api/';
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getStats(date: string){
    const url = 'http://172.16.97.216:8000/api/stats/?date=' + date;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getAJob(jobnum){
    const url = 'http://172.16.97.216:8000/api/jobnum-search?jobnum=' + jobnum;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getJobs(jobnum){
    const url = 'http://172.16.97.216:8000/api/jobnum-search?jobnum=' + jobnum;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());

  }

  getJobDetails(jobnum){
    const url = 'http://172.16.97.216:8000/api/jobdetails?jobnum=' + jobnum;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getJobsForClient(client){
    const url = 'http://172.16.97.216:8000/api/jobs-company?company=' + client;
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

  getClients(){
    const url = 'http://172.16.97.216:8000/api/companies';
    // create an Observable for the HTTP/REST API call and transform (map) the response to a JSON array
    return this.http.get(url)
      .map((response: Response) => response.json());
  }

}
