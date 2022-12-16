import { Component, OnInit } from '@angular/core';
import { ApicallService } from '../apicall.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MovieEvent, EventComponent } from '../event/event.component';
import { RankingService } from '../ranking.service';
import { environment } from 'src/environments/environment';
import jwtDecode, { JwtPayload }  from "jwt-decode";
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { concat, Observable } from 'rxjs';
import { EWMovieItem } from '../movies';
import { FinalRankingResolve } from '../finalRanking.resolve';
import { concatMap, switchMap, map, catchError } from 'rxjs/operators';


export interface JwtPayloadCognito extends JwtPayload {
  preferred_username: string;
}

@Component({
  providers:[EventComponent],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  movieEvents: MovieEvent[] = [];
  logoutURL= environment.logoutURL;
  // url that gets sent in the email for users to rank selected movies in events
  //url = 'https://moviemeetup.com/ranking/';
  url = 'https://ike-easyware.herokuapp.com/ranking/';
  //today: any;
  //date = new Date();
  host = sessionStorage.getItem('hostID');
  firstLoad = true;
  finalRankings: (EWMovieItem)[] = [];
  finalRanking = new Map();
  currentID: string = '';
  finEvent: MovieEvent | undefined
  finurl = 'https://localhost:4200/finalranking/'
  finTitle: string = '';
  finRoom: string = '';
  finTime: string = '';
  emailstring: string = `mailto:abc@abc.com?subject=files&body=${this.finTitle}`;

  constructor(private eventComponent: EventComponent, public apicall: ApicallService, private router: Router, private rankingService: RankingService, private httpClient: HttpClient, private route: ActivatedRoute, private finranking: FinalRankingResolve) {
    };

    

  ngOnInit(): void {

    //*console.log("session storage-host: "+ sessionStorage.getItem('hostID'));
    console.log("firstLoad: ", this.firstLoad);
    this.rankingService.loadMovieEventsByHostID(String(sessionStorage.getItem('hostID')));
    this.movieEvents = this.rankingService.sortMovieEvents();
    setTimeout(() => { 
      //console.log(this.getEventTitles("ulscnsf5f5"));
      //*console.log('user events: ', this.movieEvents.length);
      this.firstLoad = false;
      //*console.log("firstLoad: ", this.firstLoad);
    }, 5000);  
    //this.today = this.eventComponent.hoursConvert(this.date.getTime().toString());
    //console.log("today?: ", this.today);
  }

  getEventTitles(eventID: string | undefined): string {
    let movietitles: any[] = [];
    let targetEvent = this.movieEvents.filter((elem) => elem.id === eventID);
    //console.log(targetEvent);
    let targetmovs = targetEvent[0].eventMovies;
    for (let title of targetmovs!) {
      movietitles.push(title.title);
    }
    //console.log("title array?", movietitles);

    return movietitles.join(', ');
    //}

  }

  getResults(eventID: string)/*: Observable<MovieEvent>*/ {
    console.log("wth?: ", this.finEvent);
    //this.route.snapshot.url[0].path=`finalranking/${eventID}`;
    //this.route.snapshot = this.finurl
    //this.finEvent = this.route.snapshot.data.finalRanking;
    var first = new Promise((resolve, reject) => {
      this.apicall.getFinalRankings(eventID).subscribe((data: MovieEvent) => {this.finEvent = { ...data }, resolve(data)});
    })
    Promise.all([first]).then((values) => {
      console.log("wth?2: ", this.finEvent);
      this.finTitle = this.finEvent!.finalRankings![0].title[0];
      this.finRoom = this.finEvent!.finalRankings![0].room!;
      this.finTime = this.rankingConvert(this.finEvent!.finalRankings![0].timestamp!)
      console.log(this.finTitle, this.finTime, this.finRoom);
      this.mailMe();
  });
    console.log("wth?3: ", this.finEvent);
  
    //return this.finranking.dataReturn(eventID);
    //https://j6ywe1e02a.execute-api.us-west-2.amazonaws.com/EWFinalRankings
    //https://37knewzbfap5fhnau5tq374xsm0ahhhi.lambda-url.us-west-2.on.aws/
    /* return this.httpClient.get<MovieEvent>(`https://37knewzbfap5fhnau5tq374xsm0ahhhi.lambda-url.us-west-2.on.aws/?id=${eventID}`).
    pipe(
      map((data) => {
        console.log(data);
        console.log("getFinalRankings() data: " + JSON.stringify(data));
        return data ?? "[nope]";
      })
    ) */
    //console.log("gr: ", JSON.stringify(testres));
    //return testres;
    //return testres;
    //console.log("id for queryStringParameters:", eventID);
    /*const options = eventID ? 
    { params : new HttpParams().set('id', eventID)} : {};
    console.log("options for the FinalRanking: ", options); */

    /*
    let queryParams = new HttpParams();
    queryParams = queryParams.append("id", eventID);
    console.log("queryParams: ", queryParams);
    return this.httpClient.get<MovieEvent>(`https://j6ywe1e02a.execute-api.us-west-2.amazonaws.com/EWFinalRankings?id=${eventID}`,{params:queryParams}).
      pipe(
        map((data) => {
          console.log(data);
          console.log("getFinalRankings() data: " + JSON.stringify(data));
          return data ?? [];
        })
      )
    */
  } 

  rankingConvert(unix: string): string {
    let fullstring = this.rankingService.unixConvert(unix);
    let timeOnly = fullstring.substring(13);
    //console.log(timeOnly);
    return timeOnly;
  }
  async sendResults(eventID: string)/*: Observable<MovieEvent> */{
    this.currentID=eventID;
    console.log("currentID: ", this.currentID);
    //this.route.snapshot.url[0].path=`finalranking/${eventID}`;
    //this.finEvent = this.route.snapshot.data.finalRanking;
    //console.log(this.route);
    console.log("HP-finranking--finEvent", this.finEvent);
  
      this.getResults(this.currentID);
      console.log("test");
   
    //console.log("sr: ", JSON.stringify(results));
    //let finalRankings = results;
    //return results;

  }

  mailMe(){
    console.log("111111");
    console.log("22222");
    //document.location.reload();
    document.location.href = `mailto:?subject=${this.finEvent!.hostID}%20has%20determined%20the%20winning%20movie%20for%20the%20gathering%20at%20Circle%20Cinema%20on%20'${
      this.finEvent!.eventDate
    }'&body=The winning movie has been determined! We will be seeing:%0A%0A${this.finTitle} - ${this.finTime} - ${this.finRoom}%0A%0Aat Circle Cinema on ${this.finEvent!.eventDate}. Please use this link to buy your tickets:%0A%0A${this.finEvent!.finalRankings![0].screeninglink}%0A%0AYou can also click on the link below to see the final results and purchase your tickets from there:%0A%0A${ this.finurl }${
      this.finEvent!.id
    }%0A%0AI look forward to seeing you at Circle Cinema!%0A%0A${this.finEvent!.hostID}%0A%0A`;
}

}
