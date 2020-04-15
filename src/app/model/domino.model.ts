export class Domino{
  public value: Array<number>;
  public previous: Domino;
  public next: Domino;
  public inverted: boolean;

  constructor(first: number, second: number){
    this.value = [first, second];
    this.reset();
  }

  get total(){
    return this.value[0] + this.value[1];
  }

  reset(){
    this.previous = null;
    this.next = null
    this.inverted = false;
  }

  matchPrevious(otherDomino: Domino): boolean{
    if(!this.previous && otherDomino.value.indexOf(this.inverted?this.value[1]:this.value[0]) >= 0){
      return true;
    }else{
      return false;
    }
  }

  matchNext(otherDomino: Domino): boolean{
    if(!this.next && otherDomino.value.indexOf(this.inverted?this.value[0]:this.value[1]) >= 0){
      return true;
    }else{
      return false;
    }
  }

  isDouble(): boolean{
    return this.value[0] == this.value[1];
  }

  isInverted(): boolean{
    return this.inverted;
  }
}
