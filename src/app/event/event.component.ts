import { Component, Injectable, OnInit, ResolvedReflectiveFactory } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { MovieItem, PopMovieItem, EWMovieItem, Shows } from "../movies";
import { ApicallService } from '../apicall.service';
import { Router, RouterModule } from '@angular/router';
import { FormControl, NgModel, Validators } from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from "../event.service";
import { RankUpdate } from '../ranking/ranking.component';
import { MatSidenavModule, MatDrawerToggleResult } from "@angular/material/sidenav";


// @ts-ignore
//import { onScan } from "../../../popMoviesScan.js";

export interface MovieEvents {
  searchType: string;
  expression: string;
  Items: (MovieEvent)[]; // | null
  errorMessage: string;
}

// Modified for EW Movie info
export interface MovieEvent {
  id?: string;
  hostID: string;
  //eventTitle: string;
  eventDate: string;
  eventMovies?: (EWMovieItem) [];
  selectedMovies: EWMovieItem[];
  //invitees?: (EventInvitees) [] | null;
  eventRankings?: (RankUpdate) [];
  finalRankings?: (EWMovieItem) [];
}

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})

@Injectable()
export class EventComponent implements OnInit {
  sessionhostID = sessionStorage.getItem('hostID');
  hostID = '';
  eventID = '';
  //eventTitle = '';
  eventDate = '';
  selectedMovies: EWMovieItem[] = [];
  events = new Map();
  eventMovies: EWMovieItem[] = [];
  filteredMovies: EWMovieItem[] = [];
  timeFilteredMovies: EWMovieItem[] = [];
  invitees = [];
  movieRankings = [];
  errormsg = '';
  confmsg = '';
  public confirmed = false;
  date = new FormControl(new Date());
  gridColumns = 3;
  minDate = new Date();
  rangeBlock = true;
  //objCheck: Shows[] = [];
  public isMenuOpen: boolean = true;

  constructor(public apicall: ApicallService, private eventService: EventService, private httpClient: HttpClient, private router: Router) {}

  ngOnInit(): void {
    //this.loadEWMovies();
    // set minDate for datepicker to be 'tomorrow'--no past dates or picking today.
    this.minDate.setDate(this.minDate.getDate() +1);
    console.log("onInit:", this.eventDate);
  }

  // CALL SCAN API GATEWAY HERE? --> https://ri86qpqtti.execute-api.us-west-2.amazonaws.com/popMovies
  // Attempt to create a function that references the getPopMovies from the apicallservice. This is probably the wrong way?
  // Current gives CORS error and the GET fails.
  /*loadtheMovies = new Promise<Array<EWMovieItem>>((resolve) => {
    this.apicall.getEWMovies().subscribe((data) => {
      this.eventMovies = data;
    })
    resolve(this.eventMovies)
  });*/

  
  loadEWMovies(): Promise<Array<EWMovieItem> | any> { //async(): Promise<Array<EWMovieItem> | any> => {
    console.log("loadEWMovies called");
    return new Promise<Array<EWMovieItem> | any>(resolve => {
      this.apicall.getEWMovies().subscribe((data) => {
        this.eventMovies = data;
      })
    })
  }
  /*
    return this.apicall.getEWMovies().subscribe((data) => {
      this.eventMovies = data;
      //*console.log("loadEWMovies data:", this.eventMovies);
      //*console.log(this.eventMovies[0]);
      //let objCheck = this.eventMovies[2].shows[0].show;
      /*if (Object.prototype.toString.call(objCheck) === '[object Array]') {
        console.log("objCheck is an array");
      } else {
        console.log("objCheck is not an array");
      } */
      //console.log('0 typeof', typeof this.eventMovies[0].shows[0].show[0]);
      //console.log(this.eventMovies[2].shows[0].show);
      //console.log('2 typeof', typeof this.eventMovies[2].shows[0].show[0]);
      //let seconds = "1652383800"
      //let altSec = "1657911417"
      //let time = (s: any) => new Date(s * 1e3).toISOString(); //.slice(-13, -8);
      // YYYY-MM-DDTHH:mm:ss.sssZ
      // .slice(-13, -5) = 19:30:00
      // .slice(-5, -8) = 19:30
      //console.log(time(seconds));
      //let attempt = time(seconds).substring(0, 23);
      //console.log(attempt);
      //let test = new Date(attempt);   // new Date(parseInt(seconds)*1000)
      //this.convertToDate(test);
      //*console.log("tada?: ", this.unixConvert(seconds));
      //let secTest = new Date(parseInt(seconds) * 1e3).toISOString().substring(0,23);
      //*console.log(secTest);
      //let altTest = new Date(parseInt(altSec) * 1e3).toISOString().substring(0,23);
      //*console.log(altTest);
      //*console.log('compare? ', secTest < altTest);
      //*console.log('getHours: ', this.hoursConvert(seconds));
      //console.log(test);
      /*return this.eventMovies;})
      
  } */

  // partial convert to get comparable date info for determing time ranges?
  //  May want to make this a 'time of day' specific thing?
  //  output:  2022-05-12T19:30:00.000
  //  perhaps getting a substring of 11,16, --> getHours()?

  hoursConvert(unix: string): number {
    let show = new Date(parseInt(unix) * 1e3).toISOString().substring(0, 23);
    //console.log(show);
    let date = new Date(show);
    //console.log(date);
    return date.getHours();
  }
  
  // below converts seconds string to ISO date string, then stips the Z off the end,
  // then converts to a Date object.
  // what is next: strip off the day/month/date, then strip off the time and convert to AM/PM
  unixConvert(unix: string): string {
    let show = new Date(parseInt(unix) * 1e3).toISOString().substring(0, 23);
    //console.log('show: ', show);
    let showTime = new Date(show).toString();
    //console.log("showTime: " + showTime);
    let strDay = showTime.substring(0, 3);
    let date = new Date(show);
    //console.log('date: ', date);
    //let day = date.getDate();
    let day = showTime.substring(8, 10);
    //let month = date.getMonth() + 1;
    let strMonth = showTime.substring(4, 7);
    //let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    let zminutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + zminutes + ' ' + ampm;
    return `${strDay} ${strMonth} ${day} - ${strTime}`;
  }

  // CREATE "convertToDate" function to convert the date string to a Date object.
  convertToDate(dateString: Date): Date {
    //*console.log("dateString: ", dateString);
    let year = dateString.getFullYear();
    let month = dateString.getMonth()+1; 
    let dt = dateString.getDate();
    let date = year + '-' + (month<10 ? '0' : '') + month + '-' + (dt<10 ? '0' : '') + dt;
    //let d = new Date(date);
    let d = dateString.getDay() + ' ' + dateString.toLocaleDateString() + ' ' + dateString.toTimeString().substring(0, dateString.toTimeString().indexOf("GMT"));
    //*console.log(d);
    return new Date(d);
    //let dateParts = dateString.split("-");
    //return new Date(+dateParts[0], dateParts[1] - 1, +dateParts[2]);
  }


  async setDate(event: MatDatepickerInputEvent<Date>) {
    this.eventDate = `${event.value}`.substring(0, 15);
    console.log("New EventDate: " + this.eventDate);
    this.loadEWMovies();
    
   
    /* if (this.eventDate !== '') {
      console.log("reloading movies")
      this.loadEWMovies();
    } */
    //*console.log(event.value);
    //this.eventDate = `${event.value}`.substring(0, 15);
    //console.log("New EventDate: " + this.eventDate);
    //await this.loadEWMovies().then(await this.filterMovies(this.eventDate));
    
    //let timeoutID = setTimeout(this.filterMovies(this.eventDate), 300);
    if (this.eventMovies.length < 1) {
    let test = setTimeout(async () => {
      console.log("attempting to filter eventMovies")
      this.filterMovies(this.eventDate);
      console.log("eventMoviesTO:", this.eventMovies.length);
      console.log("datefilteredTO:", this.filteredMovies.length);
      this.rangeBlock = false; 
    }, 2000);
  } else {
    this.filterMovies(this.eventDate);
  }
    // clear error message if there was one from a previous date selection and attempted event creation.
    this.errormsg = '';
    console.log("eventMovies:", this.eventMovies.length);
    console.log("datefiltered:", this.filteredMovies.length);
    /*if (this.eventMovies != []) {
      console.log("clearing Tiemout");
      clearTimeout(test);
    } */
    //return this.filteredMovies;
  }
  
  /*filtertheMovies = new Promise<Array<EWMovieItem>>((resolve) => {
    this.filterMovies(this.eventDate: string);
    resolve()

  }*/
  //filter all movies based on selected date
  // will update the shows[0].show scrrenings array with just the ones for the date selected
  filterMovies(eventDate: string) { //: Promise<Array<EWMovieItem> | any> { //= new Promise<Array<EWMovieItem>>((resolve) => { }
    // clear timefiltered selections from a previous date selection
    if (this.timeFilteredMovies.length > 0) {
      this.timeFilteredMovies.length = 0;
    }
    console.log('filteredMovies() triggered')
    //return new Promise<Array<EWMovieItem> | any>(resolve => {
    let filtered: EWMovieItem[] = JSON.parse(JSON.stringify(this.eventMovies));
    let target = eventDate.substring(0,11);
    //*console.log('target date: ', target)
    // this will filter for the selected date:
    let arr = filtered.filter(film => {
      //return film.shows[0].show.includes()
      let screenings = film.shows[0].show;
      //console.log('screenings?: ', screenings)
      //console.log('target chk : ', this.unixConvert(screenings[0].timestamp));
      return screenings.some((entry) => this.unixConvert(entry.timestamp).substring(0,11) === target)
      /*for (let scr of screenings) {
        let temptime = this.unixConvert(scr.timestamp);
        if (temptime.substring(0,11) === target) {
            match = true;
            break;
        } */
    });
    //*console.log('arr?: ', arr);
    let selectedDate = [target];
    //this will update the shows listings for just the selected date instead of passing all screenings
    let filteredArr = arr.map(result=> {
      //let screenings = shows[0].show;
      result.shows[0].show =  result.shows[0].show.filter(screening=>selectedDate.includes(this.unixConvert(screening.timestamp).substring(0,11)))
      return result;
    });
    this.filteredMovies = filteredArr;
    this.eventService.addFilteredMoviesToEvent(this.filteredMovies);
    /* this.filteredMovies = arr;
    this.eventService.addFilteredMoviesToEvent(this.filteredMovies);
    */
    //this.selectedMovies = this.filteredMovies;
    //*console.log("filtered Movies: ", this.filteredMovies);
    //*console.log("original Movies: ", this.eventMovies);
  //})
}

  // function for filtering by daytime ranges:
  //  clicking range button will further filter filteredMovies only showing screening times in that range

    filterMoviesByTime(range: string): void {  //morning/afternoon/evening
      this.errormsg = '';
    if (this.eventMovies.length == 0) {
      console.log("no date selected!!");
      this.errormsg = "Please select a Date first.";
      //this.resetFilters();
      this.timeFilteredMovies.length = 0;
      return;
    }
    let targetRange = '';
    let timeFiltered: EWMovieItem[] = JSON.parse(JSON.stringify(this.filteredMovies));
    let start: number, end: number;
    let ranges:number[] = [];
    if (range === "morning") {
      start = 6;
      end = 11;
      ranges = Array.from({length: 6}, (x,i) => i + start); //6-11
    } else if (range === "afternoon") {
      start = 12;
      end = 16;
      ranges = Array.from({length: 5}, (x,i) => i + start); //12-16
    } else if (range === "evening") {
      start = 17;
      end = 23;
      ranges = Array.from({length: 8}, (x,i) => i + start); //17-24
    }
    //*console.log(range, ranges);
      let arr = timeFiltered.filter(scr => {
        let screenings = scr.shows[0].show;
        //*console.log(this.hoursConvert(screenings[0].timestamp));
        //*console.log('range? ',this.hoursConvert(screenings[0].timestamp))//.substr(-2,2));
        return screenings.some((entry) => this.hoursConvert(entry.timestamp) >= start && this.hoursConvert(entry.timestamp) <= end)
        //if(this.unixConvert(entry.timestamp).substring(13) > start && this.unixConvert(entry.timestamp).substring(13) < end) {
      });
      //*console.log('arr=', arr);
      if (this.eventDate != '' && arr.length == 0) {
        this.errormsg = `No movies are showing in the ${range}. Try another time range.`
        //this.resetFilters();
        //return;
      }
      let filteredArr = arr.map(result=> {
        //let screenings = shows[0].show;
        result.shows[0].show =  result.shows[0].show.filter(screening=>ranges.includes(this.hoursConvert(screening.timestamp)))
        return result;
      });
      this.timeFilteredMovies = filteredArr;
      /*if (this.timeFilteredMovies.length == 0) {
        this.errormsg = "no movies are showing for that time range.";
        this.resetFilters();
        //return;
      } else {*/
        this.eventService.addFilteredMoviesToEvent(this.timeFilteredMovies);
      //}
      //*console.log("time filtered: ", this.timeFilteredMovies);
      //*console.log("original filtered: ", this.filteredMovies);
    
  }

  resetFilters() {
    this.timeFilteredMovies.length = 0;
    this.errormsg = '';
    this.filterMovies(this.eventDate);
    console.log('filters reset');
  }

  confmessage(): void {
    this.confirmed = true;
    //*console.log("confirmed: " + this.confirmed);
    setTimeout(() => {
      this.confirmed = false;
      //*console.log("confirmed: " + this.confirmed);
    }, 4000);
  }

  createEvent() { // TO ADD: CONTENT VERIFICATION
    if (this.sessionhostID !== null) {
      this.hostID = this.sessionhostID
    };
    
    if (this.hostID === '' || this.eventDate === '') {
      this.errormsg = 'You must have a Host ID and select a Date.';
      return;
    } if (this.eventDate === null) {
      this.errormsg = 'You must select an actual Date.';
      return;
    } if (this.eventService.getNumSelected() < 3) {
      this.errormsg = 'You must have at least three movie times for guests to choose from.';
      return;
    }

    // Create new eventID: sets eventID to be 1 larger than current events map size,
    //   with added random number to prevent overwriting, should a previous event be deleted
    //this.eventID = `${this.events.size+1}` + '-' + `${Math.floor(Math.random()*1000)}`;
    //console.log(this.eventID);
    
    // Create newEvent object of MovieEvent type with the provided elements
    let newEvent: MovieEvent = {
      hostID: this.hostID,
      //eventTitle : this.eventTitle,
      eventDate : this.eventDate,
      selectedMovies : [...this.eventService.getSelectedMovies()]
    };
    // Verify newEvent object created with correct info successfully
    //*console.log(JSON.stringify(newEvent));

    // Add MovieEvent object to the events map, with the eventID as a key
    this.events.set(this.eventID, newEvent);
    // Verify MovieEvent was added to events map
    //*console.log(this.events.get(this.eventID));

    // Display all MovieEvent objects in the events map
    for (let entry of this.events.entries()) {
      console.log(entry[0], entry[1].eventDate);
    }
    this.events.forEach((value: string, key: string) => {
      console.log("KV: " + key, value);
    })
    this.apicall.addMovieEvent(newEvent).subscribe();
    //this.eventTitle = '';
    //this.eventDate = '';
    this.errormsg = '';
    this.date = new FormControl(new Date());
    //this.labelReset();
    this.eventService.resetMovieArray();
    this.filteredMovies.length = 0;
    this.timeFilteredMovies.length = 0;
    this.loadEWMovies();
    this.confmsg = `Your event for "${newEvent.eventDate}" has been created!`;
    this.confmessage();
    setTimeout(() => {
      //*console.log("attempting to filter eventMovies")
      this.router.navigateByUrl('home');
    }, 4000); 
    
    //*console.log("timefilt: ", this.timeFilteredMovies);
    //*console.log("datefilt: ", this.filteredMovies);
    //*console.log('date',this.eventDate);
    //*console.log('selectedMovs', this.selectedMovies);
    //return newEvent;
  }


  /* labelReset() {
    const app = document.getElementById('default') as HTMLDivElement;
    app.textContent = 'Choose a Date';
  } */
} 

// Pipe added to get ngFor to work with mab iterables
@Pipe({
  name: 'iterable'
})
export class IterablePipe implements PipeTransform {
  transform(iterable: any, args: any[]): any {
    let result = [];

    if (iterable.entries) {
      iterable.forEach((key: any, value: any) => {
        result.push({ key, value });
      });
    } else {
      for (let key in iterable) {
        if (iterable.hasOwnProperty(key)) {
          result.push({ key, value: iterable[key] });
        }
      }
    }

    return result;
  }
}


function filterMovies(eventDate: any, string: any) {
  throw new Error('Function not implemented.');
}

