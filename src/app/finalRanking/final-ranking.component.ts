import { Component } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ApicallService } from '../apicall.service';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieItem, movielist, popMovieSamples, PopMovieItem, EWMovieItem } from '../movies';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { MovieEvent } from '../event/event.component';
import { ActivatedRoute } from '@angular/router';
import { RankingService } from '../ranking.service';
import { RankUpdate } from '../ranking/ranking.component';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import { NameDialogComponent } from '../name-dialog/name-dialog.component';


@Component({
  selector: 'app-final-ranking',
  templateUrl: './final-ranking.component.html',
  styleUrls: ['./final-ranking.component.scss']
})
export class FinalRankingComponent implements OnInit {

  id = '';
  //eventTitle = '';
  eventDate = '';
  movieItemArray: (EWMovieItem)[] | undefined;
  movieEvent: MovieEvent | undefined;
  url = 'http://localhost:4200/finalranking/';
  rankings: RankUpdate[] = [];
  finalRankings: (EWMovieItem)[] = [];
  rankDetails: (EWMovieItem) [] | undefined;
  highestRank: EWMovieItem | undefined;
  eventIDFromRoute = "";
  hostID = environment.demoUserID;
  finalRanking = new Map();
  userRankings: RankUpdate[] = [];
  data: any;
  topChoices: String[] = [];
  gathering: MovieEvent | undefined;

  constructor(
    public apicall: ApicallService, 
    private route: ActivatedRoute,
    private rankingService: RankingService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // First get the event id from the current route.
    const routeParams = this.route.snapshot.paramMap;
    this.eventIDFromRoute = String(routeParams.get('eventID'));
    //console.log("eventIDFromRoute: " + this.eventIDFromRoute);
    
    // KEEP THIS ONE
    this.movieEvent = this.route.snapshot.data.finalRanking;
    console.log("finranking--movieEvent", this.movieEvent);
    
    this.dialog.closeAll();
    this.loadMoviesFromEvent();
  }

  loadMoviesFromEvent() {
    // if movieEvent is not undefined or null, assign movies to movieItemArray
    if (this.movieEvent != undefined) {
      //this.eventTitle = this.movieEvent.eventTitle;
      this.eventDate = this.movieEvent.eventDate;
      this.movieItemArray = this.movieEvent.eventMovies;
      console.log(this.movieEvent);

      if (this.movieEvent.eventRankings != undefined) {
        this.rankings = this.movieEvent.eventRankings;
      }

      if (this.movieEvent.finalRankings != undefined) {
        this.finalRankings = this.movieEvent.finalRankings;
        //*console.log("finalRanking: ", JSON.stringify(this.movieEvent.finalRankings));
      }
      
      if (this.movieEvent.id) {
        this.id = this.movieEvent.id;
        this.url = this.url + this.id;
      }

      if (this.movieEvent.eventRankings != undefined) {
        this.checkPointTie();
      } 
    }
  }

  checkPointTie() {
    //*console.log("???", this.finalRankings[0].screeninglink!);
    let max = this.finalRankings[0].points;
    for (let finalRanking in this.finalRankings) {
      if (max == this.finalRankings[finalRanking].points) {
        this.topChoices.push(" " + this.finalRankings[finalRanking].title);
        //*console.log("top choices: ", this.topChoices);
      }
    }
  }

  rankingConvert(unix: string): string {
    let fullstring = this.rankingService.unixConvert(unix);
    let timeOnly = fullstring.substring(13);
    //console.log(timeOnly);
    return timeOnly;
  }
}


