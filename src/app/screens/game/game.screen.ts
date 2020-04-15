import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BoardComponent, ModalComponent } from '../../components/components.module';
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

  constructor(private _router: Router){
    this.game = new Game();
    this.viewPoint = this.game.join(new Player("Sven"));
  }

  ngOnInit(){
    this.game.statusChanged().subscribe(status => {
      switch(status){
        case "Completed":
          this.modal.show();
          break;
      }
    })

    this.newGame();
  }

  selectDomino(domino: Domino){
    this.activeDomino = domino;
  }

  canPlayLeft(){
    return this.myTurn() && this.activeDomino && this.game.canPlayLeft(this.activeDomino);
  }

  canPlayRight(){
    return this.myTurn() && this.activeDomino && this.game.canPlayRight(this.activeDomino);
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

  myTurn(){
    return this.game.players[this.viewPoint] == this.game.getActivePlayer();
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
}
