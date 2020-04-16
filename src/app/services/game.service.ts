import { Injectable } from '@angular/core';
import { Game } from '../model/game.model';

@Injectable()
export class GameService{
  private _currentGame: Game;

  constructor(){
    this._currentGame = null;
  }

  startSolo(type: string): boolean{
    this._currentGame = new Game(type);
    return true;
  }

  getCurrentGame(): Game{
    return this._currentGame;
  }

  hasCurrentGame(): boolean{
    return this._currentGame !== null;
  }
}
