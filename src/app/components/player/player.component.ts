import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Player } from '../../model/player.model';
import { Domino } from '../../model/domino.model';

@Component({
  templateUrl:"./player.component.html",
  styleUrls:["./player.component.scss"],
  selector:"jn-player"
})
export class PlayerComponent{
  @Input() player: Player;
  @Input() showHand: boolean;
  @Input() active: Domino;
  @Output() pickDomino: EventEmitter<Domino>;

  constructor(){
    this.player = null;
    this.showHand = false;
    this.active = null;
    this.pickDomino = new EventEmitter<Domino>();
  }

  dominoPicked(domino: Domino){
    this.pickDomino.emit(domino);
  }

  getPoints(){
    let points = [];
    for(let i = 0; i < this.player.score; i++){
      points.push(i);
    }

    return points;
  }
}
