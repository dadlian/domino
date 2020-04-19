import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalComponent } from '../../components/components.module';
import { GameService } from '../../services/game.service';

@Component({
  templateUrl:"./menu.screen.html",
  styleUrls:["./menu.screen.scss"]
})
export class MenuScreen{
  @ViewChild("joinModal",{static:true}) joinModal: ModalComponent;
  @ViewChild("errorModal",{static:true}) errorModal: ModalComponent;
  public code: string;

  constructor(private _router: Router, private _gameService: GameService){
    this.code = "";
  }

  ngOnInit(){
  }

  soloPlay(){
    if(this._gameService.startSolo("jail")){
      this._router.navigate(["/game"]);
    }
  }

  multiplayer(){
    this._gameService.startMultiplayer("jail").then(result => {
      if(result){
        this._router.navigate(["/game"]);
      }
    })
  }

  joinGame(){
    this.joinModal.hide();
    this._gameService.loadGame(this.code).then(game => {
      if(game){
        this._router.navigate(["/game"]);
      }else{
        this.errorModal.show();
      }
    })
  }
}
