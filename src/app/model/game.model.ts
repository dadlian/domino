import { Board } from './board.model';
import { Player } from './player.model';
import { Domino } from './domino.model';
import { Observable, Subject } from 'rxjs';

export class Game{
  public code: string;
  public status: string;
  public type: string;
  public multiplayer: boolean;

  public board: Board;
  public players: Array<Player>;
  public activePlayed: boolean;

  private _self: string;
  private _deck: Array<Domino>;
  private _activePlayer: number;
  private _plays: number;
  private _statusChange: Subject<string>;
  private _firstGame: boolean;

  constructor(gameData: any){
    this.code = "000000";
    this.type = "Push";
    this.status = "Pending";
    this.multiplayer = false;

    this._self = gameData.self;
    delete gameData.self;

    Object.assign(this,gameData);

    this.board = new Board();
    this.players = [];
    this.activePlayed = false;

    this._deck = [];
    this._activePlayer = 0;
    this._plays = 0;
    this._statusChange = new Subject<string>();
    this._firstGame = true;

    //Initialise _deck
    for(let i = 0; i < 7; i++){
      for(let j = i; j < 7; j++){
        this._deck.push(new Domino(i,j));
      }
    }

    //Initialise 4 AI Players
    for(let i = 1; i <= 4; i++){
      this.players.push(new Player(`AI ${i}`,(this.type == 'Push')?"Player":"Jailman"));
    }
  }

  join(player: Player): number{
    let joined: number = -1;
    for(let i = 0; i < this.players.length; i++){
      if(!this.players[i].human){
        Object.assign(this.players[i],player);
        this.players[i].human = true;
        this.players[i].role = "Jailman";
        joined = i;
        break;
      }
    }

    return joined;
  }

  get turn(): number{
    return Math.ceil((this._plays + 1) / this.players.length);
  }

  start(){
    this.status = "Playing";
    this._statusChange.next(this.status);

    this.activePlayed = false;
    this.board.center = null;
    this._plays = 0;

    this._shuffle(5);
    this._deal();

    //Let Double Six Pose for First Game
    if(this._firstGame){
      for(let i = 0; i < this.players.length; i++){
        for(let domino of this.players[i].hand){
          if(domino.value[0] == 6 && domino.value[1] == 6){
            this._activePlayer = i;
            break;
          }
        }
      }
    }

    if(!this.getActivePlayer().human){
      setTimeout(() => {
        this._aiTurn();
      },1000)
    }
  }

  playLeft(domino: Domino): boolean{
    if(!this.canPlayLeft(domino)){
      return false;
    }

    let dominoIndex = this.players[this._activePlayer].hand.indexOf(domino);
    let validPlay = dominoIndex >= 0 && this.board.playLeft(domino);
    if(validPlay){
      this.players[this._activePlayer].hand.splice(dominoIndex,1);
      this.activePlayed = true;
    }

    return validPlay;
  }

  playRight(domino: Domino): boolean{
    if(!this.canPlayRight(domino)){
      return false;
    }

    let dominoIndex = this.players[this._activePlayer].hand.indexOf(domino);
    let validPlay = dominoIndex >= 0 && this.board.playRight(domino);
    if(validPlay){
      this.players[this._activePlayer].hand.splice(dominoIndex,1);
      this.activePlayed = true;
    }

    return validPlay;
  }

  endTurn(){
    if(this.canEndTurn()){
      //Check if game is finished
      if(this.getActivePlayer().hand.length == 0){
        this._endRound();
      }else if(this.isShut()){
        let counts = [];
        for(let player of this.players){
          counts.push(player.count);
        }

        let minCount = Math.min(...counts);
        let playerCount = counts.filter(item => item == minCount).length;
        if(playerCount == 1){
          this._activePlayer = counts.indexOf(minCount);
          this._endRound();
        }else{
          this.status = "Drawn";
          this._statusChange.next(this.status);
        }
      }else{
        this._activePlayer = (this._activePlayer + 1) % this.players.length;
        this.activePlayed = false;
        this._plays += 1;

        if(!this.getActivePlayer().human){
          setTimeout(() => {
            this._aiTurn();
          },1000)
        }
      }
    }
  }

  private _endRound(){
    if(this.type == "Push"){
      this.status = "Completed";
    }else{
      this._firstGame = false;
      this.status = "Intermission";
      this.getActivePlayer().role = "Witness";
      this.getActivePlayer().score += 1;

      //Check if everyone has come out of jail
      let squash: boolean = true;
      for(let i = 0; i < this.players.length; i++){
        squash = squash && (this.players[i].score > 0);
      }

      if(squash){
        this.status = "Squashed";
      //Check if the active player has jailed someone
    }else if(this.getActivePlayer().score == 6){
        this.status = "Victory";
        this.getActivePlayer().role = "Officer";
        let pusher = this.players[(this._activePlayer+3)%4];
        if(pusher.score == 0){
          pusher.role = "Antiman";
        }
      }
    }

    this._statusChange.next(this.status);
  }

  canPlayLeft(domino: Domino){
    if(this._firstGame && this._plays == 0){
      return domino.value[0] == 6 && domino.value[1] == 6;
    }else{
      return !this.activePlayed && this.board.canPlayLeft(domino);
    }
  }

  canPlayRight(domino: Domino){
    if(this._firstGame && this._plays == 0){
      return domino.value[0] == 6 && domino.value[1] == 6;
    }else{
      return !this.activePlayed && this.board.canPlayRight(domino);
    }
  }

  canEndTurn(){
    return this.activePlayed || this._getValidPlays(this.players[this._activePlayer]) == 0;
  }

  getActivePlayer(){
    return this.players[this._activePlayer];
  }

  statusChanged(): Observable<string>{
    return this._statusChange;
  }

  isShut(){
    let isShut: boolean = true;
    for(let player of this.players){
      isShut = isShut && (this._getValidPlays(player) == 0);
    }

    return isShut;
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

      for (i = this._deck.length - 1; i > 0; i--){
        j = Math.floor(Math.random() * (i + 1));
        candidate = this._deck[i];

        //Reset Domino
        candidate.reset();
        this._deck[i] = this._deck[j];
        this._deck[j] = candidate;
      }
    }
  }

  private _deal(){
    //Empty player's hands
    for(let player of this.players){
      player.hand.length = 0;
    }

    let cardsPerPlayer = Math.ceil(this._deck.length / this.players.length);
    for(let i = 0; i < cardsPerPlayer; i++){
      for(let j = 0; j < this.players.length; j++){
        this.players[j].deal(this._deck[(i*this.players.length)+j])
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
}
