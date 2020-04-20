import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Game } from '../model/game.model';
import { Player } from '../model/player.model';

import { timer, of } from 'rxjs';
import { map, concatMap, catchError } from 'rxjs/operators';

@Injectable()
export class GameService{
  private _root: string;
  private _currentGame: Game;
  private _activePlayers: any;

  constructor(private _httpClient: HttpClient){
    this._root = "https://dev.kycsar.com/domino/api";
    this._currentGame = null;
    this._activePlayers = {};
  }

  startSolo(type: string): boolean{
    this._currentGame = new Game({type:type,status:"Pending",multiplayer:false});
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
          this._currentGame = new Game(game);
          this._updateGame();
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
      .subscribe((game: any) => {
        if(game.total > 0 && game.entries[0].status != "Completed"){
          this._currentGame = new Game(game.entries[0]);

          this._updateGame();
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

  private _heartbeat(player: Player){
    let playerUpdate = this._httpClient.put(this._root+player.self,player);
    let heartbeat = timer(10000,10000).pipe(
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
          this._currentGame.setPlayer(player, player.position);
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
}
