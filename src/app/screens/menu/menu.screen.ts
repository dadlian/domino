import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  templateUrl:"./menu.screen.html",
  styleUrls:["./menu.screen.scss"]
})
export class MenuScreen{
  constructor(private _router: Router, private _gameService: GameService){
  }

  ngOnInit(){
  }

  soloPlay(){
    if(this._gameService.startSolo("jail")){
      this._router.navigate(["/game"]);
    }
  }
}
