import { Component, OnInit } from '@angular/core';
import { ApicallService } from '../apicall.service';
import { HttpClient } from '@angular/common/http';
import { MovieEvent, EventComponent } from '../event/event.component';
import { RankingService } from '../ranking.service';
import { environment } from 'src/environments/environment';
import jwtDecode, { JwtPayload }  from "jwt-decode";
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { EWMovieItem } from '../movies';
import { FinalRankingResolve } from '../finalRanking.resolve';



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

  constructor(private eventComponent: EventComponent, public apicall: ApicallService, private router: Router, private rankingService: RankingService, private httpClient: HttpClient, private route: ActivatedRoute) {
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

  getResults(eventID: string): Observable<MovieEvent> {
    //let results = this.apicall.getFinalRankings(eventID);
    //console.log("gr: ", results);
    //return results;
    return this.apicall.getFinalRankings(eventID);

  } 

  sendResults(eventID: string | undefined): Observable<MovieEvent> {
    let results = this.getResults(eventID!);
    console.log("sr: ", JSON.stringify(results));
    //let finalRankings = results.finalRankings;
    return results;

  }

}
