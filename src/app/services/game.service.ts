import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Game } from '../model/game.model';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GameService{
  private _root: string;
  private _currentGame: Game;

  constructor(private _httpClient: HttpClient){
    this._root = "https://dev.kycsar.com/domino/api";
    this._currentGame = null;
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
      .subscribe(game => {
        if(game){
          this._currentGame = new Game(game);
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
}
