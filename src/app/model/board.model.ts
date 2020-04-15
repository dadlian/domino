import { Domino } from './domino.model';
export class Board{
  public center: Domino;

  constructor(){
    this.center = null;
  }

  playLeft(domino: Domino): boolean{
    if(!this.center){
      this.center = domino;
      return true;
    }

    if(this.canPlayLeft(domino)){
      let leftEnd = this._getLeftEnd();
      leftEnd.previous = domino;
      domino.next = leftEnd;

      if(domino.value[0] == (leftEnd.inverted?leftEnd.value[1]:leftEnd.value[0])){
        domino.inverted = true;
      }

      return true;
    }

    return false;
  }

  playRight(domino: Domino): boolean{
    if(!this.center){
      this.center = domino;
      return true;
    }

    if(this.canPlayRight(domino)){
      let rightEnd = this._getRightEnd();
      rightEnd.next = domino;
      domino.previous = rightEnd;

      if(domino.value[1] == (rightEnd.inverted?rightEnd.value[0]:rightEnd.value[1])){
        domino.inverted = true;
      }

      return true;
    }

    return false;
  }

  canPlayLeft(domino: Domino){
    if(!this.center){
      return true;
    }

    let leftEnd = this._getLeftEnd();
    return leftEnd?leftEnd.matchPrevious(domino):true;
  }

  canPlayRight(domino: Domino){
    if(!this.center){
      return true;
    }

    let rightEnd = this._getRightEnd();
    return rightEnd?rightEnd.matchNext(domino):true;
  }

  private _getLeftEnd(){
    let leftEnd = this.center;
    while(leftEnd && leftEnd.previous){
      leftEnd = leftEnd.previous;
    }

    return leftEnd;
  }

  private _getRightEnd(){
    let rightEnd = this.center;
    while(rightEnd && rightEnd.next){
      rightEnd = rightEnd.next;
    }

    return rightEnd;
  }
}
