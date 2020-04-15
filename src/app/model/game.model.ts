import { Board } from './board.model';
import { Player } from './player.model';
import { Domino } from './domino.model';
import { Observable, Subject } from 'rxjs';

export class Game{
  public status: string;
  public board: Board;
  public deck: Array<Domino>;
  public players: Array<Player>;
  public activePlayer: number;
  public activePlayed: boolean;
  public plays: number;
  private _statusChange: Subject<string>;

  constructor(){
    this.status = "Pending";
    this.board = new Board();
    this.deck = [];
    this.players = [];
    this.activePlayer = 0;
    this.activePlayed = false;
    this.plays = 0;
    this._statusChange = new Subject<string>();

    //Initialise Deck
    for(let i = 0; i < 7; i++){
      for(let j = i; j < 7; j++){
        this.deck.push(new Domino(i,j));
      }
    }

    //Initialise 4 AI Players
    for(let i = 1; i <= 4; i++){
      this.players.push(new Player(`Player ${i}`));
    }
  }

  join(player: Player): number{
    let joined: number = -1;
    for(let i = 0; i < this.players.length; i++){
      if(!this.players[i].human){
        Object.assign(this.players[i],player);
        this.players[i].human = true;
        joined = i;
        break;
      }
    }

    return joined;
  }

  start(){
    this.status = "Playing";
    this._statusChange.next(this.status);
    this.board.center = null;
    this.plays = 0;
    this._shuffle(5);
    this._deal();

    for(let i = 0; i < this.players.length; i++){
      for(let domino of this.players[i].hand){
        if(domino.value[0] == 6 && domino.value[1] == 6){
          this.activePlayer = i;
          if(!this.getActivePlayer().human){
            setTimeout(() => {
              this._aiTurn();
            },1000)
          }

          break;
        }
      }
    }
  }

  playLeft(domino: Domino): boolean{
    if(!this.canPlayLeft(domino)){
      return false;
    }

    let dominoIndex = this.players[this.activePlayer].hand.indexOf(domino);
    let validPlay = dominoIndex >= 0 && this.board.playLeft(domino);
    if(validPlay){
      this.players[this.activePlayer].hand.splice(dominoIndex,1);
      this.activePlayed = true;
    }

    return validPlay;
  }

  playRight(domino: Domino): boolean{
    if(!this.canPlayRight(domino)){
      return false;
    }

    let dominoIndex = this.players[this.activePlayer].hand.indexOf(domino);
    let validPlay = dominoIndex >= 0 && this.board.playRight(domino);
    if(validPlay){
      this.players[this.activePlayer].hand.splice(dominoIndex,1);
      this.activePlayed = true;
    }

    return validPlay;
  }

  endTurn(){
    if(this.canEndTurn()){
      //Check if game is finished
      if(this.getActivePlayer().hand.length == 0){
        this.status = "Completed";
        this._statusChange.next(this.status);
      }else if(this.isShut()){
        let counts = [];
        for(let player of this.players){
          counts.push(player.count);
        }

        let minCount = Math.min(...counts);
        let playerCount = counts.filter(item => item == minCount).length;
        if(playerCount == 1){
          this.activePlayer = counts.indexOf(minCount);
          this.status = "Completed";
          this._statusChange.next(this.status);
        }else{
          this.status = "Drawn";
          this._statusChange.next(this.status);
        }
      }else{
        this.activePlayer = (this.activePlayer + 1) % this.players.length;
        this.activePlayed = false;
        this.plays += 1;

        if(!this.getActivePlayer().human){
          setTimeout(() => {
            this._aiTurn();
          },1000)
        }
      }
    }
  }

  get turn(): number{
    return Math.ceil((this.plays + 1) / this.players.length);
  }

  canPlayLeft(domino: Domino){
    if(this.plays == 0){
      return domino.value[0] == 6 && domino.value[1] == 6;
    }else{
      return !this.activePlayed && this.board.canPlayLeft(domino);
    }
  }

  canPlayRight(domino: Domino){
    if(this.plays == 0){
      return domino.value[0] == 6 && domino.value[1] == 6;
    }else{
      return !this.activePlayed && this.board.canPlayRight(domino);
    }
  }

  canEndTurn(){
    return this.activePlayed || this._getValidPlays(this.players[this.activePlayer]) == 0;
  }

  getActivePlayer(){
    return this.players[this.activePlayer];
  }

  statusChanged(): Observable<string>{
    return this._statusChange;
  }

  private _getValidPlays(player: Player){
    let validPlays = 0;
    for(let domino of player.hand){
      if(this.board.canPlayLeft(domino) || this.board.canPlayRight(domino)){
        validPlays += 1;
      }
    }

    return validPlays;
  }

  private _shuffle(times: number = 1){
    for(let time = 0; time < times; time++){
      let i: number = 0;
      let j: number = 0;
      let candidate: Domino = null;

      for (i = this.deck.length - 1; i > 0; i--){
        j = Math.floor(Math.random() * (i + 1));
        candidate = this.deck[i];

        //Reset Domino
        candidate.reset();
        this.deck[i] = this.deck[j];
        this.deck[j] = candidate;
      }
    }
  }

  private _deal(){
    //Empty player's hands
    for(let player of this.players){
      player.hand.length = 0;
    }

    let cardsPerPlayer = Math.ceil(this.deck.length / this.players.length);
    for(let i = 0; i < cardsPerPlayer; i++){
      for(let j = 0; j < this.players.length; j++){
        this.players[j].deal(this.deck[(i*this.players.length)+j])
      }
    }
  }

  private _aiTurn(){
    for(let domino of this.getActivePlayer().hand){
      if(this.playLeft(domino) || this.playRight(domino)){
        break;
      }
    }

    this.endTurn();
  }

  isShut(){
    let isShut: boolean = true;
    for(let player of this.players){
      isShut = isShut && (this._getValidPlays(player) == 0);
    }

    return isShut;
  }
}
