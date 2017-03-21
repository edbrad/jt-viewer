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

  jobPatterns: any[] = [];      /** the pattern details for the given Job */
  jobNumber: string;            /** this given Job number */
  company: string;              /** the given Client name for the Job */
  job: any;                     /** the given job information array from the REST query */
  aJob: any = {};               /** the given job information extracted to a single object */
  totalQty: number;             /** total pieces */
  clients: any[] = [];          /** colection of all the Clients from the REST API */
  aClient: any = {};            /** the client for the given Job (ACCESS data duplication work-around) */
  aContact: any = {};           /** the specific Contact for the given Job (ACCESS data duplication work-around) */

  pdf: any;                     /** pointer to pdfmake javascript library */

  constructor(private route: ActivatedRoute,  /** the current Angular source route */
    private ds: DataService                   /** the service that provides data from the REST API */
  ) { }

  /**
   * @method ngOnInit
   * @description initialize this Component
   */
  ngOnInit() {

    /** get the given job (number) to be displayed from the incoming route parameters */
    this.subscription = this.route.params.subscribe(params => { this.jobNumber = params['jobnum'] });

    /** get a job from the external REST API */
    this.ds.getAJob(this.jobNumber).subscribe((data => {
      this.job = data;
      this.aJob = this.job[0];
      this.company = this.job[0].Company;

      /** get corresponding company/contact information */
      this.ds.getClients().subscribe((data => {
        this.clients = data;
        this.aClient = this.clients.find(client => client.Comp === this.company);
        this.aContact = this.clients.find(client => client.Contact === this.aJob.Contact);
      }));

      /** get corresponding Patterns and tally/compute total Job quantity */
      this.ds.getJobDetails(this.jobNumber).subscribe((data => {
        this.jobPatterns = data;
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
   * @param {string} pattern - the given pattern code
   * @returns {number} the number of pieces tallyed
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
   * @description generate a PDF of the EMS Job Ticket (using pdfMake Library)
   */
  private printJobTicket() {
    this.pdf = pdfMake;
    this.pdf.createPdf(this.buildJobTicketPdf(this.company, this.jobNumber, this.aJob)).open();
  }

  /**
   * @function buildJobTicketPdf
   * @description build dynamic Job Ticket PDF layout object for the pdfMake rendering method (createPdf)
   * @param {string} company - the given Company name (for Header/Footer dynamic content)
   * @param {string} jobNumber - the given Job Number (for Header/Footer dynamic content)
   * @param {any} aJob - the given Job information object (for Header/Footer dynamic content)
   * @returns a document definition object describing the PDF to be generated by the pdfMake library
   */
  private buildJobTicketPdf(company: string, jobNumber: string, aJob: any) {
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
      /** in order to capture page number & count values, the header must be specified as a function */
      header: function (currentPage, pageCount) {
        return [
          {
            columns: [
              {
                text: company + ' - ' + jobNumber +
                '\npub: ' + moment().format('MMMM Do YYYY, h:mm:ss a'), alignment: 'left', margin: [40, 8, 30, 3], fontSize: 8
              },
              { text: 'JOB TICKET', bold: true, alignment: 'center', margin: [40, 8, 30, 3], fontSize: 18 },
              {
                text: 'Job Ticket Date: ' + moment(aJob.JobTicketDate).format('l') +
                '\nPAGE: ' + currentPage + ' OF ' + pageCount, alignment: 'right', margin: [40, 8, 30, 3], fontSize: 8, bold: true
              }
            ]
          }
        ]
      },

      // Page Body
      content: [
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 5,
              x2: 543,
              y2: 5,
              lineWidth: 0.5
            }]
        },
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
                { text: '- To: ' }
              ]
            },
            {
              width: '15%',
              margin: [0, 20, 30, 3],
              stack: [
                { text: this.jobNumber, style: 'bold' },
                { text: moment(this.aJob.DateReceived).format('l'), style: 'bold' },
                { text: this.aJob.DropDate, style: 'bold' },
                { text: (this.aJob.ToDropDate != null) ? this.aJob.ToDropDate : '-', style: 'bold' }
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
        { text: 'PATTERN DETAILS: ', bold: true, fontSize: 14 },
        { text: ' ' },
        {
          table: {
            headerRows: 0,
            widths: ['15%', '85%'],
            body: this.buildPatternBody()
          },
          layout: 'noBorders'
        },
        { text: '\nDEPARTMENTAL INSTRUCTIONS: ', style: 'bold', fontSize: 14 },
        { text: ' ' },
        {
          table: {
            headerRows: 0,
            widths: ['25%', '75%'],
            body: this.buildDepartmentBody()
          }
        },
        {
          text: [
            { text: '\nSales / CSR / Date:  ', fontSize: 9, italics: true },
            { text: this.aJob.Remark, fontSize: 9, italics: true, bold: true }
          ]
        }
      ],

      // Page Footer
      /** in order to capture page number & count values, the header must be specified as a function */
      footer: function (currentPage, pageCount) {
        return [
          {
            columns: [
              {
                text: 'MailEXEC - JT-Viewer - Demo Version' +
                '\npub: ' + moment().format('MMMM Do YYYY, h:mm:ss a'), alignment: 'left', margin: [40, 8, 30, 3], fontSize: 8
              },
              { text: '2017 - Executive Mailing Service', alignment: 'center', margin: [40, 8, 30, 3], fontSize: 8 },
              { text: 'PAGE: ' + currentPage + ' OF ' + pageCount, alignment: 'right', margin: [40, 8, 30, 3], fontSize: 8, bold: true }
            ]
          },
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
   * @description build dynamic Job Ticket PDF layout object
   * @returns {array} a collection of dynamic PDF layout parameters
   */
  private buildJobTicketBody() {
    var body = [];              /** storage for the layout parameters */

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
    body.push([{ text: 'TOTAL JOB PIECES:', style: 'bold', fontSize: 12 }, { text: this.addCommas(this.totalQty), style: 'bold', fontSize: 12 }]);

    // Done
    return body;
  }

  /**
   * @function buildPatternBody
   * @returns {array} a collection of dynamic PDF layout parameters
   */
  private buildPatternBody() {
    var body = [];              /** storage for the layout parameters */

    for (var i = 0; i < this.jobPatterns.length; i++) {
      body.push([{ text: 'Pattern ' + this.jobPatterns[i].Jobpat.toUpperCase() + ':', style: 'bold' },
      { text: this.jobPatterns[i].MailClass + ', ' + this.jobPatterns[i].Payment, style: 'bold' }]);
      if (this.jobPatterns[i].DESCP1 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP1 }]); };
      if (this.jobPatterns[i].DESCP2 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP2 }]); };
      if (this.jobPatterns[i].DESCP3 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP3 }]); };
      if (this.jobPatterns[i].DESCP4 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP4 }]); };
      if (this.jobPatterns[i].DESCP5 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP5 }]); };
      if (this.jobPatterns[i].DESCP6 != null) { body.push([{ text: ' ' }, { text: this.jobPatterns[i].DESCP6 }]); };
      body.push([{ text: ' ' }, { text: ' ' }]);

      // Domestic counts
      if (this.jobPatterns[i].cdig5bar != 0 ||
        this.jobPatterns[i].cbasbar != 0 ||
        this.jobPatterns[i].PackShip != 0 ||
        this.jobPatterns[i].cbas != 0 ||
        this.jobPatterns[i].cpre != 0 ||
        this.jobPatterns[i].ccrt != 0 ||
        this.jobPatterns[i].cwalk125 != 0 ||
        this.jobPatterns[i].csat != 0 ||
        this.jobPatterns[i].cbasbar != 0 ||
        this.jobPatterns[i].cdig3bar != 0 ||
        this.jobPatterns[i].cdig5bar != 0 ||
        this.jobPatterns[i].caadc != 0 ||
        this.jobPatterns[i].cmaadc != 0 ||
        this.jobPatterns[i].cbas3dig != 0) {
        body.push([{ text: ' ' }, { text: 'DOMESTIC POSTAL COUNTS:', style: 'bold', fontSize: 11 }]);
        body.push([{ text: ' ' }, {
          table: {
            widths: ['38%', '12%', '38%', '12%'],
            body: [
              [
                { text: '5-Digit Auto:', bold: (this.jobPatterns[i].cdig5bar > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].cdig5bar), bold: (this.jobPatterns[i].cdig5bar > 0) ? true : false },
                { text: 'Machinable 5-Digit:', bold: (this.jobPatterns[i].cbasbar > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].cbasbar), bold: (this.jobPatterns[i].cbasbar > 0) ? true : false }
              ],
              [
                { text: '3-Digit Auto:', bold: (this.jobPatterns[i].cdig3bar > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].cdig3bar), bold: (this.jobPatterns[i].cdig3bar > 0) ? true : false },
                { text: 'Machinable 3-digit:', bold: (this.jobPatterns[i].cbas3dig > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].cbas3dig), bold: (this.jobPatterns[i].cbas3dig > 0) ? true : false }
              ],
              [
                { text: 'Automated ADC/AADC:', bold: (this.jobPatterns[i].caadc > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].caadc), bold: (this.jobPatterns[i].caadc > 0) ? true : false },
                { text: 'Machinable ADC/AADC:', bold: (this.jobPatterns[i].cpre > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].cpre), bold: (this.jobPatterns[i].cpre > 0) ? true : false }
              ],
              [
                { text: 'Automated MADC/MAADC:', bold: (this.jobPatterns[i].cmaadc > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].cmaadc), bold: (this.jobPatterns[i].cmaadc > 0) ? true : false },
                { text: 'Machinable MADC/MAADC:', bold: (this.jobPatterns[i].cbas > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].cbas), bold: (this.jobPatterns[i].cbas > 0) ? true : false }
              ],
              [
                { text: 'High Density Enhanced CAR-RT: ', bold: (this.jobPatterns[i].cwalk125 > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].cwalk125), bold: (this.jobPatterns[i].cwalk125 > 0) ? true : false },
                { text: 'Basic CAR-RT:', bold: (this.jobPatterns[i].ccrt > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].ccrt), bold: (this.jobPatterns[i].ccrt) ? true : false }
              ],
              [
                { text: 'Saturation Enhanced CAR-RT: ', bold: (this.jobPatterns[i].csat > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].csat), bold: (this.jobPatterns[i].csat > 0) ? true : false },
                { text: 'Pack and Ship/Estimate:', bold: (this.jobPatterns[i].PackShip > 0) ? true : false }, { text: this.addCommas(this.jobPatterns[i].PackShip), bold: (this.jobPatterns[i].PackShip > 0) ? true : false }
              ],
            ]
          },
          fontSize: 10
        }]);
      };

      // Foreign counts
      if (this.jobPatterns[i].foreign != 0 || this.jobPatterns[i].canadian != 0) {
        body.push([{ text: ' ' }, { text: 'FOREIGN PIECE COUNTS:', style: 'bold', fontSize: 11 }]);
        body.push([{ text: ' ' }, {
          table: {
            widths: ['40%', '60%'],
            body: [
              [
                { text: 'Canadian:', bold: (this.jobPatterns[i].canadian > 0) ? true : false },
                { text: this.addCommas(this.jobPatterns[i].canadian), bold: (this.jobPatterns[i].canadian > 0) ? true : false }
              ],
              [
                { text: 'Other Foreign:', bold: (this.jobPatterns[i].foreign > 0) ? true : false },
                { text: this.addCommas(this.jobPatterns[i].foreign), bold: (this.jobPatterns[i].foreign > 0) ? true : false }
              ]
            ]
          },
          fontSize: 10
        }]);
      };
      body.push([{ text: ' ' }, { text: 'TOTAL PATTERN PIECES:    ' + this.addCommas(this.getPatQty(this.jobPatterns[i].Jobpat)), alignment: 'right', style: 'bold', fontSize: 12 }]);
      body.push([{ text: ' ' }, { text: 'MAIL-PIECE COMPONENTS:', style: 'bold', fontSize: 11 }]);
      body.push([{ text: ' ' }, {
        table: {
          headerRows: 0,
          widths: ['10%', '2%', '15%', '8%', '32%', '33%'],
          body: this.buildMailPieceBody(this.jobPatterns[i])
        },
        layout: 'lightHorizontalLines',
        fontSize: 10
      }]);
      body.push([{ text: ' ' }, { text: ' ' }]);
      body.push([
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 5,
              x2: 543,
              y2: 5,
              lineWidth: 0.5
            }], colSpan: 2
        }
      ]);
    }
    // Done
    return body;
  }

  /**
   * @function buildDepartmentBody
   * @description build Departmental instuction table
   * @returns {array} a collection of dynamic PDF layout parameters
   */
  private buildDepartmentBody() {
    var body = [];              /** storage for the layout parameters */

    body.push([{ text: 'Excess Stock:', style: 'bold' }, this.aJob.stockInst]);
    body.push([{ text: 'DP/Imaging:', style: 'bold' }, this.aJob.CRInst]);
    body.push([{ text: 'Inkjet Dept.:', style: 'bold' }, this.aJob.AdDept]);
    body.push([{ text: 'Bindery Dept.:', style: 'bold' }, this.aJob.BDInst]);
    body.push([{ text: 'Stamp Dept.:', style: 'bold' }, this.aJob.StampInst]);
    body.push([{ text: 'Inserting Dept.:', style: 'bold' }, this.aJob.InDInst]);
    body.push([{ text: 'Postage Statements:', style: 'bold' }, this.aJob.PO3602Inst]);
    //body.push([{ text: 'Salesperson/CSR:', style: 'bold' }, this.aJob.Remark]);

    // Done
    return body;
  }

  /**
   * @function buildMailPieceBody
   * @description dynamically build an array containing the data to be displayed in
   * the Mail Piece Component table section
   * @param {any} pat - Pattern/Details object to be formatted as part of the PDF
   * @returns {array} a collection of dynamic PDF layout parameters
   */
  private buildMailPieceBody(pat: any) {
    var body = [];                /** storage for the layout parameters */
    var ord: number = 1;          /** the insertion order */

    // optional outer envelope
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

    // optional Postcard
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

    // inserts (currently 25 maximum)
    if (pat.Insert1Name != null || pat.Insert1Code != null || pat.Insert1Note != null) {
      body.push([
        { text: 'Inserts:', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert1Name },
        { text: 'Code:', style: 'bold' },
        { text: pat.Insert1Code },
        { text: pat.Insert1Note }
      ]);
      ord += 1;
    }
    if (pat.Insert2Name != null || pat.Insert2Code != null || pat.Insert2Note != null) {
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
    if (pat.Insert17Name != null || pat.Insert17Code != null || pat.Insert17Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert17Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert17Code },
        { text: pat.Insert17Note }
      ]);
      ord += 1;
    }
    if (pat.Insert18Name != null || pat.Insert18Code != null || pat.Insert18Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert18Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert18Code },
        { text: pat.Insert18Note }
      ]);
      ord += 1;
    }
    if (pat.Insert19Name != null || pat.Insert19Code != null || pat.Insert19Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert19Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert19Code },
        { text: pat.Insert19Note }
      ]);
      ord += 1;
    }
    if (pat.Insert20Name != null || pat.Insert20Code != null || pat.Insert20Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert20Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert20Code },
        { text: pat.Insert20Note }
      ]);
      ord += 1;
    }
    if (pat.Insert21Name != null || pat.Insert21Code != null || pat.Insert21Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert21Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert21Code },
        { text: pat.Insert21Note }
      ]);
      ord += 1;
    }
    if (pat.Insert22Name != null || pat.Insert22Code != null || pat.Insert22Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert22Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert22Code },
        { text: pat.Insert22Note }
      ]);
      ord += 1;
    }
    if (pat.Insert23Name != null || pat.Insert23Code != null || pat.Insert23Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert23Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert23Code },
        { text: pat.Insert23Note }
      ]);
      ord += 1;
    }
    if (pat.Insert24Name != null || pat.Insert24Code != null || pat.Insert24Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert24Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert24Code },
        { text: pat.Insert24Note }
      ]);
      ord += 1;
    }
    if (pat.Insert25Name != null || pat.Insert25Code != null || pat.Insert25Note != null) {
      body.push([
        { text: ' ', style: 'bold' },
        { text: ord, style: 'bold' },
        { text: pat.Insert25Name },
        { text: ' ', style: 'bold' },
        { text: pat.Insert25Code },
        { text: pat.Insert25Note }
      ]);
      ord += 1;
    }

    // Done.
    return body;
  }

  /**
   * @function formatUsPhone
   * @description Reformat phone data into the US Phone Number format/style
   * @param {string} phone - phone number to be reformatted
   * @returns {string} the reformatted phone number
   */
  private formatUsPhone(phone: string) {
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
   * @param {string} zip - the Zip Code to be reformatted
   * @returns {string} the reformatted Zip Code
   */
  private formatUsZipCode(zip: string) {
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
   * @description use momemtJS to format a date into yy/mm/dd
   * @param {string} x the Date to be reformatted
   * @returns {string} the formatted date
   */
  private formatUsDate(x: string) {
    return moment(x).format('l')
  }

  /**
   * @function addCommas
   * @description reformatts a number by adding colums for thousands deliniation
   * @param {number} intNum the number to add commas to
   * @returns {string} the formatted number with commas (US Style)
   */
  private addCommas(intNum: number) {
    return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
  }

  /**
   * @method ngOnDestroy
   * @description Component memory clean-up
   */
  ngOnDestroy() {
    /** dispose of any active subsriptions to prevent memory leak */
    this.subscription.unsubscribe();
  }
}
