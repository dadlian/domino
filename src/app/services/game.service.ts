import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Game } from '../model/game.model';
import { Player } from '../model/player.model';

import { timer, of } from 'rxjs';
import { map, concatMap, catchError } from 'rxjs/operators';

@Injectable()
export class GameService{
  private _root: string;
  private _currentGame: Game;
  private _activePlayers: any;
  private _plays: Array<string>;

  constructor(private _httpClient: HttpClient){
    this._root = "https://dev.kycsar.com/domino/api";
    this._currentGame = null;
    this._activePlayers = {};
    this._plays = [];
  }

  startSolo(type: string, playTo: number): boolean{
    //Initialise Deck
    let deck: Array<string> = [];
    for(let i=0; i < 7; i++){
      for(let j=i; j < 7; j++){
        deck.push(`${i},${j}`);
      }
    }

    this._currentGame = new Game({type:type, playTo: playTo,status:"Pending",multiplayer:false, deck: deck.join(";")},this);
    return true;
  }

  startMultiplayer(type: string, playTo: number): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      this._httpClient.post(this._root+"/games",{type:type, playTo: playTo})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          reject(false);
          return of(new HttpResponse<any>());
        })
      )
      .subscribe((game: any) => {
        if(game){
          this._createGame(game)
          this._currentGame.multiplayer = true;
          resolve(true);
        }else{
          resolve(false);
        }
      })
    })
  }

  loadGame(code: string): Promise<Game>{
    let params = new HttpParams().set("code",code);
    return new Promise<Game>((resolve,reject)=>{
      this._httpClient.get(this._root+"/games",{params:params})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          reject(null);
          return of(new HttpResponse<any>());
        })
      )
      .subscribe((games: any) => {
        if(games.total > 0 && games.entries[0].status != "Completed"){
          this._createGame(games.entries[0])
          this._currentGame.multiplayer = true;
          resolve(this._currentGame);
        }else{
          resolve(null);
        }
      })
    })
  }

  getCurrentGame(): Game{
    return this._currentGame;
  }

  hasCurrentGame(): boolean{
    return this._currentGame !== null;
  }

  join(player: Player): Promise<number>{
    return new Promise<number>((resolve,reject)=>{
      let seat: number = -1;

      if(this._currentGame.isMultiplayer()){
        let payload = {
          name: player.name,
          role: (this._currentGame.type == 'Push')?"Player":"Jailman",
          score: player.score
        }

        this._httpClient.post(this._root+this._currentGame.self+"/players",payload)
        .pipe(catchError((error: HttpErrorResponse) => {
          reject(seat);
          return of(new HttpResponse<any>());
        }))
        .subscribe((player: any) => {
          this._currentGame.setPlayer(player, player.position);
          this._activePlayers[player.id] = player;
          this._heartbeat(player.position);
          resolve(player.position);
        })
      }else{
        seat = 0;
        this._currentGame.setPlayer(player, seat);
        resolve(seat);
      }
    })
  }

  getPlay(){
    let gameUpdate = this._httpClient.get(this._root+this._currentGame.self+"/plays");
    let poll = timer(0,2000).pipe(
      concatMap(_ => gameUpdate),
      map(response => response)
    )

    let subscription = poll.subscribe((response: any) => {
      if(response.total > this._plays.length){
        let newPlays = response.entries;
        for(let i = this._plays.length; i < newPlays.length; i++){
          let play = newPlays[i];
          this._plays.push(play)

          let playParts = play.split(",");
          let position = playParts[2];
          let activeDomino = null;

          //Get Domino to play
          for(let domino of this._currentGame.getActivePlayer().hand){
            if(domino.value[0] == playParts[0] && domino.value[1] == playParts[1]){
              activeDomino = domino;
            }
          }

          if(position == "pass"){
            this._currentGame.pass(false);
          }else if(position == "left"){
            this._currentGame.playLeft(activeDomino,false)
          }else if(position == "right"){
            this._currentGame.playRight(activeDomino,false)
          }
        }

        subscription.unsubscribe();
      }
    })
  }

  private _heartbeat(index: number){
    let player = this._currentGame.players[index];
    let playerUpdate = this._httpClient.put(this._root+player.self,player);
    let heartbeat = timer(5000,5000).pipe(
      concatMap(_ => playerUpdate),
      map(response => response)
    )

    heartbeat.subscribe(response => {
    })
  }

  private _createGame(game: any){
    game.deck = game.deck;
    this._currentGame = new Game(game,this);

    //Listen for Status Changes
    this._currentGame.statusChanged().subscribe(status => {
      if(status == "Playing"){
        this._plays = [];
      }

      this._saveGame().then(game => {
        if(status == "Intermission"){
          this._currentGame.deck = game.deck;
        }
      })
    })

    //Listen for plays
    this._currentGame.playMade().subscribe(play => {
      if(play.position == "pass"){
        this._addPlay("0,0,pass");
      }else{
        this._addPlay(`${play.domino.value[0]},${play.domino.value[1]},${play.position}`);
      }

    })

    //Initialise Game
    let params = new HttpParams().set("active","true");
    this._httpClient.get(this._root+this._currentGame.self+"/players",{params: params}).subscribe((response: any) => {
      //Add Existing players
      let totalScore = 0;
      for(let player of response.entries){
        let newPlayer = new Player(player);
        newPlayer.remote = true;
        this._currentGame.setPlayer(newPlayer, player.position);
        this._activePlayers[player.id] = player;
        totalScore += player.score;
      }

      if(totalScore > 0){
        this._currentGame.firstGame = false;
      }

      //Listen for Player Updates
      this._updatePlayers();

      //If the game has started, load the plays so far
      if(game.status == "Playing"){
        this._currentGame.deal();

        this._httpClient.get(this._root+this._currentGame.self+"/plays").subscribe((response: any) => {
          this._currentGame.auto = false;
          for(let i = 0; i < response.total; i++){
            let play = response.entries[i];
            this._plays.push(play)

            let playParts = play.split(",");
            let position = playParts[2];
            let activeDomino = null;

            //Get Domino to play
            for(let domino of this._currentGame.getActivePlayer().hand){
              if(domino.value[0] == playParts[0] && domino.value[1] == playParts[1]){
                activeDomino = domino;
              }
            }

            if(position == "pass"){
              this._currentGame.pass(false);
            }else if(position == "left"){
              this._currentGame.playLeft(activeDomino,false)
            }else if(position == "right"){
              this._currentGame.playRight(activeDomino,false)
            }
          }

          this._currentGame.auto = true;
          this._currentGame.waitForPlay();
        })
      }
    })
  }

  private _updatePlayers(){
    let params = new HttpParams().set("active","true");
    let playerUpdate = this._httpClient.get(this._root+this._currentGame.self+"/players",{params: params});
    let updatePlayers = timer(0,5000).pipe(
      concatMap(_ => playerUpdate),
      map(response => response)
    )

    updatePlayers.subscribe((result: any) => {
      let activeIds = [];

      //Check for added players
      for(let player of result.entries){
        activeIds.push(player.id);
        if(Object.keys(this._activePlayers).indexOf(player.id) < 0){
          let newPlayer = new Player(player);
          newPlayer.remote = true;
          this._currentGame.setPlayer(newPlayer, player.position);
          this._activePlayers[player.id] = player;
        }
      }

      //Check for removed players
      let savedPlayers = Object.keys(this._activePlayers);
      for(let i=0; i < savedPlayers.length; i++){
        if(activeIds.indexOf(savedPlayers[i]) < 0){
          this._currentGame.removePlayer(this._activePlayers[savedPlayers[i]].position);
          delete this._activePlayers[savedPlayers[i]];
        }
      }
    })
  }

  private _saveGame(): Promise<any>{
    return new Promise<any>((resolve, reject) => {
      let status = this._currentGame.status;
      if(status == "Victory" || status == "Squashed"){
        status = "Completed";
      }else if(status == "Drawn"){
        status = "Intermission";
      }

      this._httpClient.put(this._root+this._currentGame.self,{status: status, shield: this._currentGame.activePlayer}).pipe(
        catchError((error: HttpErrorResponse) => {
          return of(new HttpResponse<any>())
        })
      ).subscribe((response: Game) => {
        resolve(response)
      })
    })
  }

  private _addPlay(play: string){
    this._plays.push(play);
    this._httpClient.post(this._root+this._currentGame.self+"/plays",{play:play}).subscribe(result => {
    })
  }
}
