import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';

import { GameService } from '../services/game.service';

@Injectable()
export class GameGuard implements CanActivate, CanActivateChild{
  constructor(private _router: Router, private _gameService: GameService){}

  canActivate(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject)=>{
      if(this._gameService.hasCurrentGame()){
        resolve(true);
      }else{
        this._router.navigate(["/menu"]);
        resolve(false);
      }
    })
  }

  canActivateChild(): Promise<boolean>{
    return this.canActivate();
  }
}
