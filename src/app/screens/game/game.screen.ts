import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BoardComponent, ModalComponent, SummaryComponent } from '../../components/components.module';
import { FullScreenService } from '../../services/fullscreen.service';
import { GameService } from '../../services/game.service';
import { Game } from '../../model/game.model';
import { Domino } from '../../model/domino.model';
import { Player } from '../../model/player.model';

@Component({
  templateUrl:"./game.screen.html",
  styleUrls:["./game.screen.scss"]
})
export class GameScreen{
  @ViewChild(BoardComponent,{static:true}) board: BoardComponent;
  @ViewChild("joinModal",{static:true}) joinModal: ModalComponent;
  @ViewChild("statusModal",{static:true}) statusModal: ModalComponent;
  @ViewChild(SummaryComponent,{static:true}) summary: SummaryComponent;
  public game: Game;
  public player: Player;
  public activeDomino: Domino;
  public viewPoint: number;
  public timer: number;

  constructor(private _router: Router, private _gameService: GameService, private _fullScreenService: FullScreenService){
    this.game = null;
    this.player = new Player({});
    this.activeDomino = null;
    this.viewPoint = 0;
    this.timer = 10;
  }

  ngOnInit(){
    this.game = this._gameService.getCurrentGame();
    this.joinModal.show();

    this.game.statusChanged().subscribe(status => {
      switch(status){
        case "Playing":
          this.activeDomino = null;
          this.board.reset();
          this.statusModal.hide();
          break;
        case "Intermission":
        case "Drawn":
          this.statusModal.show();

          if(this.game.isMultiplayer()){
            setTimeout(() => {
              this._continueGame();
            },1000);
          }

          break;
        case "Completed":
        case "Victory":
        case "Squashed":
          if(this.game.type == "jail"){
            this.summary.show();
          }else{
            this.statusModal.show();
          }

          break;
      }
    })
  }

  selectDomino(domino: Domino){
    if(!this.game.isWatching()){
      this.activeDomino = domino;
    }
  }

  playLeft(){
    if(this.canPlayLeft()){
      this.game.playLeft(this.activeDomino);
      this.activeDomino = null;
    }
  }

  playRight(){
    if(this.canPlayRight()){
      this.game.playRight(this.activeDomino);
      this.activeDomino = null;
    }
  }

  join(){
    if(!this.player.name){
      return;
    }

    this.player.role = (this.game.type == 'Push')?"Player":"Jailman";
    this._gameService.join(this.player).then(viewPoint => {
      this.viewPoint = viewPoint;

      if(this.viewPoint < 0){
        this.viewPoint = 0;
      }

      this.joinModal.hide();
      if(this.game.status !== "Playing"){
        this.statusModal.show();
      }
    })
  }

  mainMenu(){
    this._router.navigate(["/"]);
  }

  canPlayLeft(){
    return this.myTurn() && this.activeDomino && this.game.canPlayLeft(this.activeDomino);
  }

  canPlayRight(){
    return this.myTurn() && this.activeDomino && this.game.canPlayRight(this.activeDomino);
  }

  myTurn(){
    return this.game.players[this.viewPoint] == this.game.getActivePlayer();
  }

  exit(){
    this._fullScreenService.closeFullScreen();
    this._router.navigate(["/"]);
  }

  private _continueGame(){
    if(this.timer > 0){
      this.timer--;
      setTimeout(() => {
        this._continueGame();
      },1000)
    }else{
      this.timer = 10;
      this.game.start();
    }
  }
}
