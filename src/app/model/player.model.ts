import { Domino } from './domino.model';

export class Player{
  public name: string;
  public role: string;
  public score: number;
  public avatar: string;
  public human: boolean;
  public hand: Array<Domino>;

  constructor(name: string, role: string = "Player"){
    this.name = name;
    this.role = role;
    this.score = 0;
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
