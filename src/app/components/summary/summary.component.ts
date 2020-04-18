import { Component, Input } from '@angular/core';
import { Game } from '../../model/game.model';

@Component({
  "templateUrl":"./summary.component.html",
  "styleUrls":["./summary.component.scss"],
  "selector":"jn-summary"
})
export class SummaryComponent{
  @Input() game: Game;
  public visible: boolean;
  public summary: Array<{name: string, points: number, officer: number, witness: number, bonus: number, push: number, face: number, antiman: number}>;

  constructor(){
    this.game = null;
    this.visible = false;
    this.summary = [];
  }

  ngOnInit(){
  }

  show(){
    this._generateSummary();
    this.visible = true;
    document.body.style.overflow = "hidden";
  }

  hide(){
    this.visible = false;
    document.body.style.overflow = "auto";
  }

  private _generateSummary(){
    for(let i = 0; i < this.game.players.length; i++){
      let score = {name: "", points: 0, officer: 0, witness: 0, bonus: 0, push: 0, face: 0, antiman: 0}
      let player = this.game.players[i];
      score.name = player.role+" "+player.name;

      if(player.role == "Officer"){
        score.points += 3;
        score.officer = 3;

        //Check for antiman bonus
        if(this.game.players[(i+3)%4].role == "Antiman"){
          score.points += 1;
          score.bonus = 1;
        }
      }

      if(player.role == "Witness"){
        score.points += 1;
        score.witness = 1;
      }

      if(player.role == "Jailman"){
        //Check for push
        if(this.game.players[(i+3)%4].role == "Officer"){
          score.points -= 1;
          score.push = -1;
        //Check for face
        }else if(this.game.players[(i+2)%4].role == "Officer"){
          score.points -= 2;
          score.face = -2;
        }
      }

      if(player.role == "Antiman"){
        score.points -= 3;
        score.antiman = -3;
      }

      this.summary.push(score);
    }

    this.summary.sort((a, b) => {
      return b.points - a.points;
    })
  }
}
