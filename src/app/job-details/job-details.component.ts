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
  aContact: any = {};

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
        this.aContact = this.clients.find(client => client.Contact === this.aJob.Contact);
        //console.log('client: ' + JSON.stringify(this.aContact));
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
        {
          columns: [
            { width: '33%', text: this.company + ' - ' + this.jobNumber, alignment: 'left', fontSize: 10 },
            { width: '33%', text: 'JOB TICKET', style: 'bold', alignment: 'center', fontSize: 18 },
            { width: '33%', text: 'Job Ticket Date: ' + moment(this.aJob.JobTicketDate).format('l') + '\nPage x of y', alignment: 'right', fontSize: 10 }
          ], margin: [30, 8, 30, 3]
        },
        {
          canvas: [
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
                { text: this.aContact.Contact + ': ' + this.formatUsPhone(this.aContact.phone), style: 'bold' },
                { text: this.aContact.Comp },
                { text: this.aContact.Add1 },
                { text: this.aContact.Add2 },
                { text: this.aContact.City + ', ' + this.aContact.state + ' ' + this.formatUsZipCode(this.aContact.zip) }
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
            headerRows: 0,
            widths: ['25%', '75%'],
            body: this.buildJobTicketBody()
          },
        },
        { text: ' ' },
        { text: 'PATTERN DETAILS: ', style: 'bold', fontSize: 14 },
        { text: ' ' },
        {
          table: {
            headerRows: 0,
            widths: ['15%', '85%'],
            body: this.buildPatternBody()
          },
          layout: 'noBorders'
        },
        { text: 'DEPARTMENTAL INSTRUCTIONS: ', style: 'bold', fontSize: 14 },
        { text: ' ' },
        {
          table: {
            headerRows: 0,
            widths: ['25%', '75%'],
            body: this.buildDepartmentBody()
          }
        }
      ],
      // Page Footer
      footer: {
        margin: [30, 8, 30, 3],
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
      styles: {
        bold: { bold: true }
      }
    };
    // Done
    return docDefinition;
  }

  /**
   * @function buildJobTicketBody
   */
  private buildJobTicketBody() {
    var body = [];
    body.push([{ text: 'Job Description:', style: 'bold' }, { text: this.aJob.JobDescp, style: 'bold' }]);
    body.push([{ text: 'Permit:', style: 'bold' }, this.aJob.Permit]);
    body.push([{ text: 'Postage:', style: 'bold' }, this.aJob.PostageBy]);
    body.push([{ text: 'Special Info:', style: 'bold' }, { text: this.aJob.MeterInst, style: 'bold' }]);
    body.push([{ text: 'Receiving Dept.:', style: 'bold' }, this.aJob.RDept]);
    body.push([{ text: 'Samples:', style: 'bold' }, this.aJob.Sample1]);
    if (this.aJob.Sample2 != null) { body.push([{ text: ' ' }, this.aJob.Sample2]); };
    if (this.aJob.Sample3 != null) { body.push([{ text: ' ' }, this.aJob.Sample3]); };
    if (this.aJob.Sample4 != null) { body.push([{ text: ' ' }, this.aJob.Sample4]); };
    if (this.aJob.Sample5 != null) { body.push([{ text: ' ' }, this.aJob.Sample5]); };
    if (this.aJob.Sample6 != null) { body.push([{ text: ' ' }, this.aJob.Sample6]); };
    if (this.aJob.Sample7 != null) { body.push([{ text: ' ' }, this.aJob.Sample7]); };
    if (this.aJob.Sample8 != null) { body.push([{ text: ' ' }, this.aJob.Sample8]); };
    if (this.aJob.Sample9 != null) { body.push([{ text: ' ' }, this.aJob.Sample9]); };
    if (this.aJob.Sample10 != null) { body.push([{ text: ' ' }, this.aJob.Sample10]); };
    if (this.aJob.Sample11 != null) { body.push([{ text: ' ' }, this.aJob.Sample11]); };
    if (this.aJob.Sample12 != null) { body.push([{ text: ' ' }, this.aJob.Sample12]); };
    if (this.aJob.Sample13 != null) { body.push([{ text: ' ' }, this.aJob.Sample13]); };
    if (this.aJob.Sample14 != null) { body.push([{ text: ' ' }, this.aJob.Sample14]); };
    if (this.aJob.Sample15 != null) { body.push([{ text: ' ' }, this.aJob.Sample15]); };
    if (this.aJob.Sample16 != null) { body.push([{ text: ' ' }, this.aJob.Sample16]); };
    if (this.aJob.Sample17 != null) { body.push([{ text: ' ' }, this.aJob.Sample17]); };
    if (this.aJob.Sample18 != null) { body.push([{ text: ' ' }, this.aJob.Sample18]); };
    if (this.aJob.Sample19 != null) { body.push([{ text: ' ' }, this.aJob.Sample19]); };
    if (this.aJob.Sample20 != null) { body.push([{ text: ' ' }, this.aJob.Sample20]); };
    if (this.aJob.Sample21 != null) { body.push([{ text: ' ' }, this.aJob.Sample21]); };
    if (this.aJob.Sample22 != null) { body.push([{ text: ' ' }, this.aJob.Sample22]); };
    body.push([{ text: 'TOTAL QTY:', style: 'bold', fontSize: 12 }, { text: this.addCommas(this.totalQty), style: 'bold', fontSize: 12 }]);
    //
    return body;
  }

  /**
   * @function buildPatternBody
   */
  private buildPatternBody() {
    var body = [];
    for (var i = 0; i < this.jobPatterns.length; i++) {
      body.push([{ text: 'Pattern ' + this.jobPatterns[i].Jobpat.toUpperCase() + ':', style: 'bold' },
      { text: this.jobPatterns[i].MailClass + ', ' + this.jobPatterns[i].Payment, style: 'bold' }]);
      if (this.jobPatterns[i].DESCP1 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP1 }]); };
      if (this.jobPatterns[i].DESCP2 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP2 }]); };
      if (this.jobPatterns[i].DESCP3 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP3 }]); };
      if (this.jobPatterns[i].DESCP4 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP4 }]); };
      if (this.jobPatterns[i].DESCP5 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP5 }]); };
      if (this.jobPatterns[i].DESCP6 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP6 }]); };
      body.push([{ text: ' ' }, {
        table: {
          widths: ['38%', '12%', '38%', '12%'],
          body: [
            [{ text: '5-Digit Auto:' }, { text: this.addCommas(this.jobPatterns[i].cdig5bar) }, { text: 'Machinable 5-Digit:' }, { text: this.addCommas(this.jobPatterns[i].cbasbar) }],
            [{ text: '3-Digit Auto:' }, { text: this.addCommas(this.jobPatterns[i].cdig3bar) }, { text: 'Machinable 3-digit:' }, { text: this.addCommas(this.jobPatterns[i].cbas3dig) }],
            [{ text: 'Automated ADC/AADC:' }, { text: this.addCommas(this.jobPatterns[i].caadc) }, { text: 'Machinable ADC/AADC:' }, { text: this.addCommas(this.jobPatterns[i].cpre) }],
            [{ text: 'Automated MADC/MAADC:' }, { text: this.addCommas(this.jobPatterns[i].cmaadc) }, { text: 'Machinable MADC/MAADC:' }, { text: this.addCommas(this.jobPatterns[i].cbas) }],
            [{ text: 'High Density Enhanced CAR-RT: ' }, { text: this.addCommas(this.jobPatterns[i].cwalk125) }, { text: 'Basic CAR-RT:' }, { text: this.addCommas(this.jobPatterns[i].ccrt) }],
            [{ text: 'Saturation Enhanced CAR-RT: ' }, { text: this.addCommas(this.jobPatterns[i].csat) }, { text: 'Pack and Ship/Estimate:' }, { text: this.addCommas(this.jobPatterns[i].PackShip) }],
            [{ text: ' ' }, { text: ' ' }, { text: 'TOTAL: ', style: 'bold', fontSize: 11 }, { text: this.addCommas(this.getPatQty(this.jobPatterns[i].Jobpat)), style: 'bold', fontSize: 11 }]
          ]
        },
        fontSize: 10
      }]);
      body.push([{text: ' '}, { text: 'MAIL-PIECE COMPONENTS:', style: 'bold', fontSize: 11}]);
      body.push([{ text: ' ' }, {
        table: {
          headerRows: 0,
          widths: ['10%', '2%', '15%', '8%', '32%', '33%'],
          body: this.buildMailPieceBody(this.jobPatterns[i])
        },
        layout: 'noBorders',
        fontSize: 10
      }]);
      body.push([{ text: ' ' }, { text: ' ' }]);
    }
    return body;
  }

  /**
   * @function buildDepartmentBody
   */
  private buildDepartmentBody() {
    var body = [];
    body.push([{ text: 'Excess Stock:', style: 'bold' }, this.aJob.stockInst]);
    body.push([{ text: 'DP/Imaging:', style: 'bold' }, this.aJob.CRInst]);
    body.push([{ text: 'Inkjet Dept.:', style: 'bold' }, this.aJob.AdDept]);
    body.push([{ text: 'Bindery Dept.:', style: 'bold' }, this.aJob.BDInst]);
    body.push([{ text: 'Stamp Dept.:', style: 'bold' }, this.aJob.StampInst]);
    body.push([{ text: 'Inserting Dept.:', style: 'bold' }, this.aJob.InDInst]);
    body.push([{ text: 'Postage Statements:', style: 'bold' }, this.aJob.PO3602Inst]);
    body.push([{ text: 'Salesperson/CSR:', style: 'bold' }, this.aJob.Remark]);
    return body;
  }

  /**
   * @function buildMailPieceBody
   */
  private buildMailPieceBody(pat) {
    var body = [];
    var ord: number = 1;
    if (pat.OuterName != null || pat.OuterCode != null || pat.OuterNote != null) {
      body.push([
        { text: 'Outer:', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.OuterName },
        { text: 'Code:', style: 'bold' },
        { text: pat.OuterCode },
        { text: pat.OuterNote }
      ]);
      ord += 1;
    };

    if (pat.PostName1 != null || pat.PostCode1 != null || pat.PostNote1 != null) {
      body.push([
        { text: 'Postcard:', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.PostName1 },
        { text: 'Code:', style: 'bold' },
        { text: pat.PostCode1 },
        { text: pat.PostNote1 }
      ]);
      ord += 1;
    }

    if (pat.Insert1Name != null || pat.Insert1Code != null || pat.Insert1Note != null){
      body.push([
        { text: 'Inserts:', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert1Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert1Code },
        { text: pat.Insert1Note }
      ]);
      ord += 1;
    }
    if (pat.Insert2Name != null || pat.Insert2Code != null || pat.Insert2Note != null){
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert2Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert2Code },
        { text: pat.Insert2Note }
      ]);
      ord += 1;
    }
    if (pat.Insert3Name != null || pat.Insert3Code != null || pat.Insert3Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert3Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert3Code },
        { text: pat.Insert3Note }
      ]);
      ord += 1;
    }
    if (pat.Insert4Name != null || pat.Insert4Code != null || pat.Insert4Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert4Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert4Code },
        { text: pat.Insert4Note }
      ]);
      ord += 1;
    }
    if (pat.Insert5Name != null || pat.Insert5Code != null || pat.Insert5Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert5Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert5Code },
        { text: pat.Insert5Note }
      ]);
      ord += 1;
    }
    if (pat.Insert6Name != null || pat.Insert6Code != null || pat.Insert6Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert6Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert6Code },
        { text: pat.Insert6Note }
      ]);
      ord += 1;
    }
    if (pat.Insert7Name != null || pat.Insert7Code != null || pat.Insert7Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert7Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert7Code },
        { text: pat.Insert7Note }
      ]);
      ord += 1;
    }
    if (pat.Insert8Name != null || pat.Insert8Code != null || pat.Insert8Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert8Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert8Code },
        { text: pat.Insert8Note }
      ]);
      ord += 1;
    }
    if (pat.Insert9Name != null || pat.Insert9Code != null || pat.Insert9Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert9Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert9Code },
        { text: pat.Insert9Note }
      ]);
      ord += 1;
    }
    if (pat.Insert10Name != null || pat.Insert10Code != null || pat.Insert10Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert10Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert10Code },
        { text: pat.Insert10Note }
      ]);
      ord += 1;
    }
    if (pat.Insert11Name != null || pat.Insert11Code != null || pat.Insert11Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert11Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert11Code },
        { text: pat.Insert11Note }
      ]);
      ord += 1;
    }
    if (pat.Insert12Name != null || pat.Insert12Code != null || pat.Insert12Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert12Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert12Code },
        { text: pat.Insert12Note }
      ]);
      ord += 1;
    }
    if (pat.Insert13Name != null || pat.Insert13Code != null || pat.Insert13Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert13Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert13Code },
        { text: pat.Insert13Note }
      ]);
      ord += 1;
    }
    if (pat.Insert14Name != null || pat.Insert14Code != null || pat.Insert14Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert14Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert14Code },
        { text: pat.Insert14Note }
      ]);
      ord += 1;
    }
    if (pat.Insert15Name != null || pat.Insert15Code != null || pat.Insert15Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert15Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert15Code },
        { text: pat.Insert15Note }
      ]);
      ord += 1;
    }
    if (pat.Insert16Name != null || pat.Insert16Code != null || pat.Insert16Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert16Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert16Code },
        { text: pat.Insert16Note }
      ]);
      ord += 1;
    }

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
   * @function formatUsDate
   * @param x
   */
  private formatUsDate(x: string) {
    return moment(x).format('l')
  }

  /**
   * @function addCommas
   * @param intNum
   */
  private addCommas(intNum) {
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
