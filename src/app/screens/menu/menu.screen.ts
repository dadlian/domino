import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalComponent } from '../../components/components.module';
import { GameService } from '../../services/game.service';

@Component({
  templateUrl:"./menu.screen.html",
  styleUrls:["./menu.screen.scss"]
})
export class MenuScreen{
  @ViewChild("setupModal",{static:true}) setupModal: ModalComponent;
  @ViewChild("joinModal",{static:true}) joinModal: ModalComponent;
  @ViewChild("errorModal",{static:true}) errorModal: ModalComponent;

  public code: string;
  public type: string;
  public playTo: string;

  private _mode: string;

  constructor(private _router: Router, private _gameService: GameService){
    this.code = "";
    this.type = "";
    this.playTo = "1";

    this._mode = "";
  }

  ngOnInit(){
    this._mode = "solo";
    this.type = "push";
    this.setupGame();
  }


  soloPlay(){
    this._mode = "solo";
    this.setupModal.show();
  }

  multiplayer(){
    this._mode = "multiplayer";
    this.setupModal.show();
  }

  setupGame(){
    if(!this.type || !this.playTo){
      return;
    }

    if(this._mode == "solo"){
      if(this._gameService.startSolo(this.type,parseInt(this.playTo))){
        this._router.navigate(["/game"]);
      }
    }else if(this._mode == "multiplayer"){
      this._gameService.startMultiplayer(this.type,parseInt(this.playTo)).then(result => {
        if(result){
          this._router.navigate(["/game"]);
        }
      })
    }
  }

  joinGame(){
    if(!this.code){
      return true;
    }

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
