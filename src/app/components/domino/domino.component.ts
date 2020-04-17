import { Component, Input } from '@angular/core';
import { Domino } from '../../model/domino.model';

@Component({
  templateUrl:"./domino.component.html",
  styleUrls:["./domino.component.scss"],
  selector:"jn-domino"
})
export class DominoComponent{
  @Input() domino: Domino;
  @Input() hidden: boolean;

  constructor(){
    this.domino = new Domino(0,0);
    this.hidden = false;
  }
}
