declare var pdfMake: any;       /** prevent TypeScript typings error when using non-TypeSCript Lib (pdfmake) */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';
import { Observable } from "rxjs/Observable";

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit, OnDestroy {

  private subscription: any;    /** the Observable subscription to the routing Service */

  jobPatterns: any[] = [];
  jobNumber: string;
  company: string;
  job: any;
  aJob: any = {};
  totalQty: number;
  clients: any[] = [];
  aClient: {} = {};

  pdf: any;   /** pointer to pdfmake javascript library */

  constructor(private route: ActivatedRoute, private ds: DataService) { }

  /**
   * @method ngOnInit
   * @description initialize Component
   */
  ngOnInit() {

    /** get the given job (number) to be displayed from the incoming route parameters */
    this.subscription = this.route.params.subscribe(params => { this.jobNumber = params['jobnum'] });

    /** get a job from the external REST API */
    this.ds.getAJob(this.jobNumber).subscribe((data => {
      this.job = data;
      //console.log('job: ' + JSON.stringify(this.job));
      this.aJob = this.job[0];
      this.company = this.job[0].Company;

      /** get corresponding company/contact information */
      this.ds.getClients().subscribe((data => {
        this.clients = data;
        this.aClient = this.clients.find(client => client.Comp === this.company);
        //console.log('client: ' + JSON.stringify(this.aClient));
      }));

      /** get corresponding Patterns and tally/compute total Job quantity */
      this.ds.getJobDetails(this.jobNumber).subscribe((data => {
        this.jobPatterns = data;
        //console.log('job patterns: ' + JSON.stringify(this.jobPatterns));
        this.totalQty = 0;
        for (var i = 0; i < this.jobPatterns.length; i++) {
          this.totalQty += parseInt(this.jobPatterns[i].PackShip);
          this.totalQty += parseInt(this.jobPatterns[i].cbas);
          this.totalQty += parseInt(this.jobPatterns[i].cpre);
          this.totalQty += parseInt(this.jobPatterns[i].ccrt);
          this.totalQty += parseInt(this.jobPatterns[i].cwalk125);
          this.totalQty += parseInt(this.jobPatterns[i].csat);
          this.totalQty += parseInt(this.jobPatterns[i].cbasbar);
          this.totalQty += parseInt(this.jobPatterns[i].cdig3bar);
          this.totalQty += parseInt(this.jobPatterns[i].cdig5bar);
          this.totalQty += parseInt(this.jobPatterns[i].caadc);
          this.totalQty += parseInt(this.jobPatterns[i].cmaadc);
          this.totalQty += parseInt(this.jobPatterns[i].cbas3dig);
          this.totalQty += parseInt(this.jobPatterns[i].foreign);
          this.totalQty += parseInt(this.jobPatterns[i].canadian);
        }
      }));

    }));
  }

  /**
   * @function getPatternCount
   * @description get the number of Patterns found for the given Job
   * @returns {number} the number of Patterns found
   */
  private getPatternCount() {
    return this.jobPatterns.length;
  }

  /**
   * @function getPatQty
   * @description get the number of pieces for a given pattern
   * @param pattern {string} the given pattern
   * @returns {number} the number of pieces tallied
   */
  private getPatQty(pattern: string) {
    var patQty = 0;
    for (var i = 0; i < this.jobPatterns.length; i++) {
      if (pattern == this.jobPatterns[i].Jobpat) {
        patQty += parseInt(this.jobPatterns[i].PackShip);
        patQty += parseInt(this.jobPatterns[i].cbas);
        patQty += parseInt(this.jobPatterns[i].cpre);
        patQty += parseInt(this.jobPatterns[i].ccrt);
        patQty += parseInt(this.jobPatterns[i].cwalk125);
        patQty += parseInt(this.jobPatterns[i].csat);
        patQty += parseInt(this.jobPatterns[i].cbasbar);
        patQty += parseInt(this.jobPatterns[i].cdig3bar);
        patQty += parseInt(this.jobPatterns[i].cdig5bar);
        patQty += parseInt(this.jobPatterns[i].caadc);
        patQty += parseInt(this.jobPatterns[i].cmaadc);
        patQty += parseInt(this.jobPatterns[i].cbas3dig);
        patQty += parseInt(this.jobPatterns[i].foreign);
        patQty += parseInt(this.jobPatterns[i].canadian);
      }
    }
    return patQty;
  }

  /**
   * @method printJobTicket
   * @description generate a PDF of the EMS Job Ticket
   */
  private printJobTicket() {
    this.pdf = pdfMake;
    this.pdf.createPdf(this.buildJobTicketPdf()).open();
  }

  /**
   * @function buildJobTicketPdf
   * @description build Job Ticket PDF layout object
   * @returns an object describing the PDF to be generated
   */
  private buildJobTicketPdf() {
    var docDefinition = {
      // PDF Metadata
      info: {
        title: 'Executive Mailing Service Job Ticket - Job Number ' + this.jobNumber,
        author: 'Executive Mailing Service - Edward Bradley',
        subject: 'Executive Mailing Service Job Ticket PDF',
        keywords: 'EMS Job Ticket'
      },
      // Page Layout
      pageMargins: [40, 80, 40, 40],
      // Page Header
      header: ['line1','line2'],
      // Page Body
      content: [],
      // Page Footer
      footer: {
        margin: 20,
        columns: [
          {
            width: '33%',
            text: ''
          },
          {
            width: '33%',
            text: '2017 - Executive Mailing Service'
          },
          {
            width: '33%',
            text: ' '
          }
        ]
      }
    };
    // Done
    return docDefinition;
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
   * @method ngOnDestroy
   * @description Component memory clean-up
   */
  ngOnDestroy() {
    /** dispose of subsription to prevent memory leak */
    this.subscription.unsubscribe();
  }
}
