import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BoardComponent, ModalComponent } from '../../components/components.module';
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
  @ViewChild(ModalComponent,{static:true}) modal: ModalComponent;
  public game: Game;
  public activeDomino: Domino;
  public viewPoint: number;

  constructor(private _router: Router, private _gameService: GameService){
    this.viewPoint = 0;
  }

  ngOnInit(){
    this.game = this._gameService.getCurrentGame();
    this.modal.show()

    this.game.statusChanged().subscribe(status => {
      switch(status){
        case "Playing":
          this.modal.hide();
          break;
        case "Intermission":
          this.modal.show();
          break;
        case "Completed":
          this.modal.show();
          break;
      }
    })
  }

  selectDomino(domino: Domino){
    this.activeDomino = domino;
  }

  endTurn(){
    if(this.myTurn()){
      this.game.endTurn();
    }
  }

  playLeft(){
    if(this.canPlayLeft()){
      this.game.playLeft(this.activeDomino);
      this.activeDomino = null;
      this.game.endTurn();
    }
  }

  playRight(){
    if(this.canPlayRight()){
      this.game.playRight(this.activeDomino);
      this.activeDomino = null;
      this.game.endTurn();
    }
  }

  start(){
    this.viewPoint = this.game.join(new Player("Sven"));
    this.newGame();
  }

  newGame(){
    this.modal.hide();
    this.activeDomino = null;
    this.board.reset();
    this.game.start();
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
