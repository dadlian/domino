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
  public summary: Array<{name: string, points: number, breakdown: string}>;

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
      let score = {name: "", points: 0, breakdown: ""}
      let player = this.game.players[i];
      score.name = player.role+" "+player.name;

      if(player.role == "Officer"){
        score.points += 3;
        score.breakdown += "3 (Officer)";

        //Check for antiman bonus
        if(this.game.players[(i+3)%4].role == "Antiman"){
          score.points += 1;
          score.breakdown += " + 1 (Bonus)";
        }
      }

      if(player.role == "Witness"){
        score.points += 1;
        score.breakdown += "1 (Witness)";
      }

      if(player.role == "Jailman"){
        //Check for push
        if(this.game.players[(i+3)%4].role == "Officer"){
          score.points -= 1;
          score.breakdown += "-1 (Push)";
        //Check for face
        }else if(this.game.players[(i+2)%4].role == "Officer"){
          score.points -= 2;
          score.breakdown += "-2 (Face)";
        }
      }

      if(player.role == "Antiman"){
        score.points -= 3;
        score.breakdown += "-3 (Antiman)";
      }

      this.summary.push(score);
    }

    this.summary.sort((a, b) => {
      return b.points - a.points;
    })
  }
}
