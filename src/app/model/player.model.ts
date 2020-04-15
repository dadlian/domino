import { Domino } from './domino.model';

export class Player{
  public name: string;
  public role: string;
  public avatar: string;
  public human: boolean;
  public hand: Array<Domino>;

  constructor(name: string){
    this.name = name;
    this.role = "Player";
    this.avatar = "avatar.png";
    this.human = false;
    this.hand = [];
  }

  deal(domino: Domino){
    this.hand.push(domino);
  }

  get count(): number{
    let count: number = 0;

    for(let domino of this.hand){
      count += domino.total;
    }

    return count;
  }
}
