/* import { Component, OnInit } from '@angular/core';
import { MovieEvent } from '../event/event.component';
import { PopMovieItem } from '../movies';
import { ActivatedRoute } from '@angular/router';
import { RankingService } from '../ranking.service';
import { Router } from '@angular/router';
import { ApicallService } from '../apicall.service';
import { HttpClient } from '@angular/common/http'; */
import { Component } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ApicallService } from '../apicall.service';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieItem, movielist, popMovieSamples, PopMovieItem } from '../movies';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { MovieEvent } from '../event/event.component';
import { ActivatedRoute } from '@angular/router';
import { RankingService } from '../ranking.service';
import { RankUpdate } from '../ranking/ranking.component';


@Component({
  selector: 'app-final-ranking',
  templateUrl: './final-ranking.component.html',
  styleUrls: ['./final-ranking.component.scss']
})
export class FinalRankingComponent implements OnInit {

  id = '';
  eventTitle = '';
  eventDate = '';
  movieItemArray: (PopMovieItem)[] | undefined;
  movieEvent: MovieEvent | undefined;
  url = 'http://localhost:4200/finalranking/';
  rankings: (RankUpdate)[] | undefined;
  rankDetails: (PopMovieItem) [] | undefined;
  highestRank: PopMovieItem | undefined;
  movieEvents: MovieEvent[] = [];
  // TEMP VARIABLES - until ranking service bug is fixed?
  demoID = "DEMO";
  //movieEvents: MovieEvent[] = [];
  
  constructor(public apicall: ApicallService, private rankingService: RankingService, private router: Router, private httpClient: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
     // First get the event id from the current route.
     const routeParams = this.route.snapshot.paramMap;
     const eventIDFromRoute = String(routeParams.get('eventID'));
     console.log("eventIDFromRoute: " + eventIDFromRoute);
     
  
     //this.rankingService.loadMovieEventsByHostID(this.demoID);

     
     
      
    
      this.movieEvents = this.rankingService.getMovieEvents();
      this.movieEvent = JSON.parse(JSON.stringify(this.rankingService.getMovieEventByEventID(environment.demoUserID, eventIDFromRoute)))
     
  // this.movieEvent = this.rankingService.getMovieEventByEventID(eventIDFromRoute);
  console.log("movieEvent: " + JSON.stringify(this.movieEvent));

    this.loadMoviesFromEvent();

   
}
  

  loadMoviesFromEvent() {
    // if movieEvent is not undefined or null, assign movies to movieItemArray
    if (this.movieEvent != undefined) {
      this.eventTitle = this.movieEvent.eventTitle;
      this.eventDate = this.movieEvent.eventDate;
      this.movieItemArray = this.movieEvent.eventMovies;
      this.rankings = this.movieEvent.eventRankings;


      if (this.rankings != undefined) {
        // this.rankDetails =;
        const specRank = this.rankings[1];
        console.log("specRank: " + JSON.stringify(specRank));
        // console.log("target: " + JSON.stringify(this.movieEvent.eventRankings[3]));
        console.log("target userID: " + specRank.userID);
        
        console.log("target rankings: " + JSON.stringify(specRank.UserRankings));
        if (specRank.UserRankings) {        
          console.log("target first movie in UserRankings: " + JSON.stringify(specRank.UserRankings[3]));
          console.log("UserRankings length: " + specRank.UserRankings.length);
          //let urank = JSON.parse(JSON.stringify(specRank.UserRankings[3]));
          //console.log("test: " + urank);

          //let urankings = specRank.UserRankings.join();
          //console.log("urankings(JPJS): " + JSON.parse(JSON.stringify(urankings)));
          //console.log("urankings lgth: " + urankings.length);
        }
        console.log("target points: " + specRank.UserRankings![1].points);
        
        // cant seem to drill into the RankUpdate "rankings" attribute in any way--it's a PopMovieItem[], but I can't target just the first item, for example --> 'specRank.rankings[1]' doesn't work
        // JSON.stringify(specRank.rankings) doesnt change anything.
        
      }
      if (this.movieEvent.id) {
        this.id = this.movieEvent.id;
        this.url = this.url + this.id;
      }
    }
    this.findTopMovie();
  }

  findTopMovie() {
    let topMovie;
    let maxValue = 0;
    if (this.rankings != undefined) { 
    let specRank = this.rankings[1]
    for (let i=0; i< specRank!.UserRankings!.length; i++) {
      let newValue = this.rankings![1].UserRankings![i].points;
      if (newValue != undefined && newValue > maxValue) {
        maxValue = newValue;
        topMovie = this.rankings![1].UserRankings![i];
      }
    }
  }
    this.highestRank = topMovie;
  }

}
