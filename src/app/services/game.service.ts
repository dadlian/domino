import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Game } from '../model/game.model';
import { Player } from '../model/player.model';
import { Domino } from '../model/domino.model';

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

  startSolo(type: string): boolean{
    this._currentGame = new Game({type:type,status:"Pending",multiplayer:false},this);
    return true;
  }

  startMultiplayer(type: string): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      this._httpClient.post(this._root+"/games",{type:type})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          reject(false);
          return of(new HttpResponse<any>());
        })
      )
      .subscribe((game: any) => {
        if(game){
          this._createGame(game)
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
          this._currentGame.status = "Pending";
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

      if(this._currentGame.multiplayer){
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
          this._heartbeat(player);
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
    let gameUpdate = this._httpClient.get(this._root+this._currentGame.self);
    let poll = timer(0,2000).pipe(
      concatMap(_ => gameUpdate),
      map(response => response)
    )

    let subscription = poll.subscribe((game: any) => {
      let newPlays = game.plays?game.plays.split(";"):[];

      if(newPlays.length > this._plays.length){
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
            this._currentGame.pass();
          }else if(position == "left"){
            this._currentGame.playLeft(activeDomino)
          }else if(position == "right"){
            this._currentGame.playRight(activeDomino)
          }
        }

        subscription.unsubscribe();
      }
    })
  }

  private _heartbeat(player: Player){
    let playerUpdate = this._httpClient.put(this._root+player.self,player);
    let heartbeat = timer(5000,5000).pipe(
      concatMap(_ => playerUpdate),
      map(response => response)
    )

    heartbeat.subscribe(response => {
    })
  }

  private _updateGame(){
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

  private _unpackDeck(deckString: string){
    let deck: Array<Domino> = [];
    for(let domino of deckString.split(";")){
      let values = domino.split(",");
      deck.push(new Domino(parseInt(values[0]),parseInt(values[1])));
    }

    return deck;
  }

  private _createGame(game: any){
    game.deck = this._unpackDeck(game.deck);
    this._currentGame = new Game(game,this);
    this._updateGame();

    this._currentGame.statusChanged().subscribe(status => {
      switch(status){
        case "Playing":
          this._plays = [];
          break;
        case "Intermission":
          break;
        case "Completed":
          break;
        case "Victory":
          break;
        case "Squashed":
          break;
      }

      this._saveGame();
    })

    this._currentGame.playMade().subscribe(play => {
      if(play.position == "pass"){
        this._addPlay("0,0,pass");
      }else{
        this._addPlay(`${play.domino.value[0]},${play.domino.value[1]},${play.position}`);
      }

    })
  }

  private _saveGame(){
    return new Promise<boolean>((resolve, reject) => {
      this._httpClient.put(this._root+this._currentGame.self,{status: this._currentGame.status}).pipe(
        catchError((error: HttpErrorResponse) => {
          return of(new HttpResponse<any>())
        })
      ).subscribe(response => {
        resolve(true)
      })
    })
  }

  private _addPlay(play: string){
    this._plays.push(play);
  }
}
