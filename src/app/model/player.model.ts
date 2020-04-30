import { Domino } from './domino.model';

export class Player{
  public self: string;
  public id: string;
  public name: string;
  public role: string;
  public score: number;
  public avatar: string;
  public human: boolean;
  public remote: boolean;
  public hand: Array<Domino>;

  constructor(playerData: any){
    this.self = "";
    this.name = "";
    this.role = "";
    this.score = 0;
    this.avatar = "avatar.png";
    this.human = false;
    this.remote = false;
    this.hand = [];

    Object.assign(this,playerData);
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
