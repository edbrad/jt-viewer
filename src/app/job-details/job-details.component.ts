declare var pdfMake: any;       /** prevent TypeScript typings error when using non-TypeSCript Lib (pdfmake) */
declare var moment: any;        /** prevent TypeScript typings error when using non-TypeSCript Lib (momentJS) */
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
  aClient: any = {};

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
      // Page Layout
      pageSize: 'LETTER',
      pageOrientation: 'portrait',
      // PDF Metadata
      info: {
        title: 'Executive Mailing Service Job Ticket - Job Number ' + this.jobNumber,
        author: 'Executive Mailing Service - Edward Bradley',
        subject: 'Executive Mailing Service Job Ticket PDF',
        keywords: 'EMS Job Ticket'
      },
      // Page Header
      header: [
        { columns: [
          { width: '33%', text: this.company + ' - ' + this.jobNumber, alignment: 'left', fontSize: 10 },
          { width: '33%', text: 'JOB TICKET', style: 'bold', alignment: 'center', fontSize: 18 },
          { width: '33%', text: 'Job Ticket Date: ' + moment(this.aJob.JobTicketDate).format('l') + '\nPage x of y', alignment: 'right', fontSize: 10 }
        ], margin: [30,8,30,3]},
        { canvas: [
          {
            type: 'line',
            x1: 30,
            y1: 5,
            x2: 575,
            y2: 5,
            lineWidth: 0.5
          }
        ]
      }],
      // Page Body
      content: [
        {
          columns: [
            {
              width: '60%',
              margin: [0, 20, 30, 3],
              stack: [
                { text: this.aClient.Contact + ': ' + this.formatUsPhone(this.aClient.phone), style: 'bold' },
                { text: this.aClient.Comp},
                { text: this.aClient.Add1},
                { text: this.aClient.Add2},
                { text: this.aClient.City + ', ' + this.aClient.state + ' ' + this.formatUsZipCode(this.aClient.zip) }
              ]
            },
            {
              width: '25%',
              margin: [0, 20, 30, 3],
              stack: [
                { text: 'Job Number: ' },
                { text: 'Date Received: ' },
                { text: 'Drop Date: ' },
                { text: 'To: ' }
              ]
            },
            {
              width: '15%',
              margin: [0, 20, 30, 3],
              stack: [
                { text: this.jobNumber, style: 'bold' },
                { text: moment(this.aJob.DateReceived).format('l'), style: 'bold' },
                { text: this.aJob.DropDate, style: 'bold' },
                { text: this.aJob.ToDropDate, style: 'bold' }
              ]
            }
          ]
        },
        { text: ' ' },
        {
          table: {
            headerRows: 1,
            widths: ['25%', '75%'],
            body: this.buildJobTicketBody()
          },
          layout: 'noBorders'
        },
        { text: ' '},
        { text: 'PATTERN DETAILS: ', style: 'bold', fontSize: 14},
        { text: ' '},
        {
          table: {
            headerRows: 0,
            widths: ['15%', '85%'],
            body: this.buildPatternBody()
          },
          layout: 'noBorders'
        },
        { text: 'DEPARTMENTAL INSTRUCTIONS: ', style: 'bold', fontSize: 14},
        { text: ' ' },
        {
          table: {
            headerRows: 1,
            widths: ['25%', '75%'],
            body: this.buildDepartmentBody()
          }
        },
      ],
      // Page Footer
      footer: {
        margin: [30,8,30,3],
        columns: [
          {
            width: '33%',
            text: 'JT-Viewer - Version 0.0.0',
            fontSize: 8
          },
          {
            width: '33%',
            text: '2017 - Executive Mailing Service',
            fontSize: 8,
            alignment: 'center'
          },
          {
            width: '33%',
            text: 'Page x of y',
            fontSize: 8,
            alignment: 'right'
          }
        ]
      },
      styles:{
        bold: { bold: true }
      }
    };
    // Done
    return docDefinition;
  }

  /**
   *
   */
  private buildJobTicketBody(){
    var body = [];
    body.push([{ text: 'Job Description:', style: 'bold'}, this.aJob.JobDescp]);
    body.push([{ text: 'Permit:', style: 'bold'}, this.aJob.Permit]);
    body.push([{ text: 'Postage:', style: 'bold'}, this.aJob.PostageBy]);
    body.push([{ text: 'Special Info:', style: 'bold'}, { text: this.aJob.MeterInst, style: 'bold'}]);
    body.push([{ text: 'Receiving Dept.:', style: 'bold'}, this.aJob.RDept]);
    body.push([{ text: 'Samples:', style:'bold'}, this.aJob.Sample1]);
    if (this.aJob.Sample2 != null){body.push([{ text: ' '}, this.aJob.Sample2]);};
    if (this.aJob.Sample3 != null){body.push([{ text: ' '}, this.aJob.Sample3]);};
    if (this.aJob.Sample4 != null){body.push([{ text: ' '}, this.aJob.Sample4]);};
    if (this.aJob.Sample5 != null){body.push([{ text: ' '}, this.aJob.Sample5]);};
    if (this.aJob.Sample6 != null){body.push([{ text: ' '}, this.aJob.Sample6]);};
    if (this.aJob.Sample7 != null){body.push([{ text: ' '}, this.aJob.Sample7]);};
    if (this.aJob.Sample8 != null){body.push([{ text: ' '}, this.aJob.Sample8]);};
    if (this.aJob.Sample9 != null){body.push([{ text: ' '}, this.aJob.Sample9]);};
    if (this.aJob.Sample10 != null){body.push([{ text: ' '}, this.aJob.Sample10]);};
    if (this.aJob.Sample11 != null){body.push([{ text: ' '}, this.aJob.Sample11]);};
    if (this.aJob.Sample12 != null){body.push([{ text: ' '}, this.aJob.Sample12]);};
    if (this.aJob.Sample13 != null){body.push([{ text: ' '}, this.aJob.Sample13]);};
    if (this.aJob.Sample14 != null){body.push([{ text: ' '}, this.aJob.Sample14]);};
    if (this.aJob.Sample15 != null){body.push([{ text: ' '}, this.aJob.Sample15]);};
    if (this.aJob.Sample16 != null){body.push([{ text: ' '}, this.aJob.Sample16]);};
    if (this.aJob.Sample17 != null){body.push([{ text: ' '}, this.aJob.Sample17]);};
    if (this.aJob.Sample18 != null){body.push([{ text: ' '}, this.aJob.Sample18]);};
    if (this.aJob.Sample19 != null){body.push([{ text: ' '}, this.aJob.Sample19]);};
    if (this.aJob.Sample20 != null){body.push([{ text: ' '}, this.aJob.Sample20]);};
    if (this.aJob.Sample21 != null){body.push([{ text: ' '}, this.aJob.Sample21]);};
    if (this.aJob.Sample22 != null){body.push([{ text: ' '}, this.aJob.Sample22]);};
    body.push([{ text: 'TOTAL QTY:', style:'bold', fontSize: 12}, { text: this.addCommas(this.totalQty), style: 'bold', fontSize: 12}]);
    //
    return body;
  }

  private buildPatternBody() {
    var body = [];
    var patternCount = 0;
    console.log(JSON.stringify(this.jobPatterns));
    for (var i = 0; i < this.jobPatterns.length; i++) {
      body.push([{ text: 'Pattern ' + this.jobPatterns[i].Jobpat.toUpperCase() + ':', style: 'bold' }, { text: this.jobPatterns[i].MailClass + ', ' + this.jobPatterns[i].Payment }]);
      if (this.jobPatterns[i].DESCP1 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP1 }]); };
      if (this.jobPatterns[i].DESCP2 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP2 }]); };
      if (this.jobPatterns[i].DESCP3 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP3 }]); };
      if (this.jobPatterns[i].DESCP4 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP4 }]); };
      if (this.jobPatterns[i].DESCP5 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP5 }]); };
      if (this.jobPatterns[i].DESCP6 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP6 }]); };
      body.push([{ text: ' ' }, {
        table: {
          widths: ['40%', '10%', '40%', '10%'],
          body: [
            [{ text: '5-Digit Auto:' }, { text: this.addCommas(this.jobPatterns[i].cdig5bar) }, { text: 'Machinable 5-Digit:' }, { text: this.addCommas(this.jobPatterns[i].cbasbar) }],
            [{ text: '3-Digit Auto:' }, { text: this.addCommas(this.jobPatterns[i].cdig3bar) }, { text: 'Machinable 3-digit:' }, { text: this.addCommas(this.jobPatterns[i].cbas3dig) }],
            [{ text: 'Automated ADC/AADC:'}, { text: this.addCommas(this.jobPatterns[i].caadc) }, { text: 'Machinable ADC/AADC:' }, { text: this.addCommas(this.jobPatterns[i].cpre) }],
            [{ text: 'Automated MADC/MAADC:' }, { text: this.addCommas(this.jobPatterns[i].cmaadc) }, { text: 'Machinable MADC/MAADC:' }, { text: this.addCommas(this.jobPatterns[i].cbas) }],
            [{ text: 'High Density Enhanced CAR-RT: ' }, { text: this.addCommas(this.jobPatterns[i].cwalk125) }, { text: 'Basic CAR-RT:' }, { text: this.addCommas(this.jobPatterns[i].ccrt) }],
            [{ text: 'Saturation Enhanced CAR-RT: ' }, { text: this.addCommas(this.jobPatterns[i].csat) }, { text: 'Pack and Ship/Estimate:' }, { text: this.addCommas(this.jobPatterns[i].PackShip) }],
            [{ text: ' ' },{ text: ' ' },{ text: 'TOTAL: ', style: 'bold', fontSize: 11 }, { text: this.addCommas(this.getPatQty(this.jobPatterns[i].Jobpat)), style: 'bold', fontSize: 11}]
          ]
        },
        //layout: 'noBorders',
        fontSize: 10
      }]);
      body.push([{ text: ' ' }, { text: ' '}]);
    }

    //console.log(body);
    return body;
  }

  private buildDepartmentBody() {
    var body = [];
    body.push([{ text: 'Excess Stock:', style: 'bold' }, this.aJob.stockInst]);
    body.push([{ text: 'DP/Imaging:', style: 'bold' }, this.aJob.CRInst]);
    body.push([{ text: 'Inkjet Dept.:', style: 'bold' }, this.aJob.AdDept]);
    body.push([{ text: 'Bindery Dept.:', style: 'bold' }, this.aJob.BDInst]);
    body.push([{ text: 'Inserting Dept.:', style: 'bold' }, this.aJob.InDInst]);
    body.push([{ text: 'Postage Statements:', style: 'bold' }, this.aJob.PO3602Inst]);
    body.push([{ text: 'Salesperson/CSR:', style: 'bold' }, this.aJob.Remark]);
    return body;
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
      return ' ';
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
   *
   * @param x
   */
  private formatUsDate(x: string){
    return moment(x).format('l')
  }

  /**
   *
   * @param intNum
   */
  private addCommas(intNum){
    return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
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
