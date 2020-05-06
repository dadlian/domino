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
  private _plays: any;

  constructor(private _httpClient: HttpClient){
    this._root = "https://dev.kycsar.com/domino/api";
    this._currentGame = null;
    this._activePlayers = {};
    this._plays = {};
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
    let params = new HttpParams().set("code",code.toUpperCase());
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

      //Check if player is already in game and connect this session if so
      for(let i=0; i < this._currentGame.players.length; i++){
        if(this._currentGame.players[i].name == player.name){
          seat = i;
          break;
        }
      }

      if(seat >= 0){
        this._currentGame.players[seat].human = true;
        this._currentGame.players[seat].remote = false;
        this._heartbeat(this._currentGame.players[seat]);

        if(this._currentGame.status == "Pending"){
          this._waitForStart();
        }

        resolve(seat);
      }else if(this._currentGame.isMultiplayer()){
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

          if(this._currentGame.status == "Pending"){
            this._waitForStart();
          }

          resolve(player.position);
        })
      }else{
        seat = 0;
        this._currentGame.setPlayer(player, seat);
        resolve(seat);
      }
    })
  }

  private _createGame(game: any){
    game.deck = game.deck;
    this._currentGame = new Game(game,this);

    //Listen for Status Changes
    this._currentGame.statusChanged().subscribe(status => {
      if(status == "Playing"){
        this._plays = {};
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
        this._addPlay(this._currentGame.turn, "0,0,pass");
      }else{
        this._addPlay(this._currentGame.turn,`${play.domino.value[0]},${play.domino.value[1]},${play.position}`);
      }

    })

    //Initialise Game
    this._httpClient.get(this._root+this._currentGame.self+"/players").subscribe((response: any) => {
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

      //Listen for Play Updates
      this._updatePlays();

      //If the game has started, load the plays so far
      if(game.status == "Playing"){
        this._currentGame.deal();

        this._httpClient.get(this._root+this._currentGame.self+"/plays").subscribe((response: any) => {
          this._currentGame.auto = false;
          for(let turn of Object.keys(response.entries)){
            let play = response.entries[turn].play;

            if(!this._plays[turn]){
              this._plays[turn] = play;

              let position = play[2];
              let activeDomino = null;

              //Get Domino to play
              for(let domino of this._currentGame.getActivePlayer().hand){
                if(domino.value[0] == parseInt(play[0]) && domino.value[1] == parseInt(play[1])){
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
          }

          this._currentGame.auto = true;
          this._currentGame.waitForPlay();
        })
      }
    })
  }

  private _updatePlayers(){
    let playerUpdate = this._httpClient.get(this._root+this._currentGame.self+"/players");
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

  private _heartbeat(player: Player){
    let playerUpdate = this._httpClient.put(this._root+player.self,player);
    let heartbeat = timer(10000,10000).pipe(
      concatMap(_ => playerUpdate),
      map(response => response)
    )

    heartbeat.subscribe(response => {
    })
  }

  private _updatePlays(){
    let poll = timer(0,2500).pipe(
      concatMap(_ => this._httpClient.get(this._root+this._currentGame.self+"/plays",{params: new HttpParams().set("turn",this._getNextTurn().toString())})),
      map(response => response)
    )

    poll.subscribe((response: {turn: number, play: Array<string>}) => {
      if(!this._plays[response.turn]){
        let turn = response.turn;
        let play = response.play;
        if(turn > 0 && !this._plays[turn]){
          let position = play[2];
          let activeDomino = null;

          //Get Domino to play
          for(let domino of this._currentGame.getActivePlayer().hand){
            if(domino.value[0] == parseInt(play[0]) && domino.value[1] == parseInt(play[1])){
              activeDomino = domino;
            }
          }

          let success: boolean = true;
          if(position == "pass"){
            success = success && this._currentGame.pass(false);
          }else if(position == "left"){
            success = success && this._currentGame.playLeft(activeDomino,false)
          }else if(position == "right"){
            success = success && this._currentGame.playRight(activeDomino,false)
          }

          if(success){
            this._addPlay(turn,play.join(","));
          }
        }
      }
    })
  }

  private _waitForStart(){
    let gameUpdate = this._httpClient.get(this._root+this._currentGame.self);
    let updateGate = timer(0,5000).pipe(
      concatMap(_ => gameUpdate),
      map(response => response)
    )

    updateGate.subscribe((game: any) => {
      if(game.status == "Playing"){
        this._currentGame.start();
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

  private _addPlay(turn: number, play: string){
    if(!this._plays[turn]){
      this._plays[turn] = play;
      this._httpClient.post(this._root+this._currentGame.self+"/plays",{play:`${turn},${play}`}).subscribe(result => {})
    }
  }

  private _getNextTurn(){
    let turns = [];
    for(let turn of Object.keys(this._plays)){
      turns.push(parseInt(turn));
    }

    return (turns.length > 0)?Math.max(...turns)+1:1;
  }
}
