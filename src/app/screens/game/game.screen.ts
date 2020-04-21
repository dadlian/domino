import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BoardComponent, ModalComponent, SummaryComponent } from '../../components/components.module';
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

  constructor(private _router: Router, private _gameService: GameService){
    this.game = null;
    this.player = new Player({});
    this.activeDomino = null;
    this.viewPoint = 0;
  }

  ngOnInit(){
    this.game = this._gameService.getCurrentGame();
    this.joinModal.show()

    this.game.statusChanged().subscribe(status => {
      switch(status){
        case "Playing":
          this.activeDomino = null;
          this.board.reset();
          this.statusModal.hide();
          break;
        case "Intermission":
          this.statusModal.show();
          break;
        case "Completed":
          this.statusModal.show();
          break;
        case "Victory":
          this.summary.show();
          break;
        case "Squashed":
          this.summary.show();
          break;
      }
    })
  }

  selectDomino(domino: Domino){
    this.activeDomino = domino;
  }

  pass(){
    if(this.myTurn()){
      this.game.pass();
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

    this._gameService.join(this.player).then(viewPoint => {
      this.viewPoint = viewPoint;

      if(this.viewPoint < 0){
        this.viewPoint = 0;
      }

      this.joinModal.hide();
      if(!this.game.multiplayer || this.game.seatsAvailable() > 0){
        this.statusModal.show();
      }
    })
  }

  mainMenu(){
    this._router.navigate(["/menu"]);
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
}
