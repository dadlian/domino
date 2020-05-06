import { Board } from './board.model';
import { Player } from './player.model';
import { Domino } from './domino.model';
import { Observable, Subject } from 'rxjs';
import { GameService } from '../services/game.service';

export class Game{
  public self: string;
  public code: string;
  public status: string;
  public type: string;
  public playTo: number;
  public players: Array<Player>;
  public board: Board;
  public playClock: number;
  public turn: number;

  private _deck: Array<Domino>;
  private _multiplayer: boolean;
  private _activePlayed: boolean;
  private _activePlayer: number;
  private _firstGame: boolean;
  private _statusChange: Subject<string>;
  private _playMade: Subject<{domino: Domino, position: string}>;
  private _auto: boolean;
  private _timeout: number;

  constructor(gameData: any, private _gameService: GameService){
    //Initialise Public Variables
    this.self = "";
    this.code = "000000";
    this.status = "Pending";
    this.type = "Push";
    this.players = [];
    this.deck = "";
    this.playTo = 6;
    this.playClock = 0;
    this.turn = 1;

    //Initialise active player
    let shield = gameData.shield;
    delete gameData.shield;

    //Load Public Variable from arguments
    let deck = gameData.deck;
    delete gameData.players;
    delete gameData.deck;
    Object.assign(this,gameData);

    //Load Active Player
    this._activePlayer = shield;

    //Load deck
    this.deck = deck;

    //Load Private Variables
    this._firstGame = true;
    this._auto = true;
    this._multiplayer = false;
    this.board = new Board();
    this._statusChange = new Subject<string>();
    this._playMade = new Subject<{domino: Domino, position: string}>();
    this._activePlayed = false;
    this._timeout = 20;

    //Initialise deck
    if(this.deck.length == 0){
      for(let i = 0; i < 7; i++){
        for(let j = i; j < 7; j++){
          this.deck.push(new Domino(i,j));
        }
      }
    }

    //Initialise 4 AI Players
    let ais = ["T-1000","Wall-E","C-3PO","R2-D2","Rosie","Optimus","Megatron","HAL","Bender","Watson","ASIMO","Robocop","Fembot",
                "Ultron","Vision","Megazord","Cyrax","Data","Calculon","KITT","J.A.R.V.I.S","F.R.I.D.A.Y","R.O.B"];

    let seed = 0;
    for(let letter of this.code){
      seed += letter.charCodeAt(0);
    }
    seed = seed % ais.length;

    for(let i = 0; i < 4; i++){
      this.players.push(new Player({name: `${ais.splice((seed+4*i)%ais.length,1)[0]}`,role: (this.type == 'Push')?"Player":"Jailman"}));
    }
  }

  get deck(): any{
    return this._deck;
  }

  set deck(deckString: any){
    let deck: Array<Domino> = [];
    for(let domino of deckString.split(";")){
      let values = domino.split(",");
      deck.push(new Domino(parseInt(values[0]),parseInt(values[1])));
    }

    this._deck = deck;
  }

  set multiplayer(multiplayer: boolean){
    this._multiplayer = multiplayer;
  }

  get activePlayer(): number{
    return this._activePlayer;
  }

  set auto(auto: boolean){
    this._auto = auto;
  }

  set firstGame(firstGame: boolean){
    this._firstGame = firstGame;
  }

  setPlayer(player: Player, index: number): boolean{
    if(this.players[index].human){
      return false;
    }else{
      let hand = this.players[index].hand;
      Object.assign(this.players[index],player);
      this.players[index].hand = hand;
      this.players[index].human = true;

      if(this.seatsAvailable() == 0){
        this.start();
      }

      return true;
    }
  }

  removePlayer(index: number): boolean{
    if(this.players[index].human){
      this.players[index].human = false;
      this.players[index].name = `AI ${index+1}`;
    }else{
      return false;
    }
  }

  seatsAvailable(): number{
    let seatsAvailable = 0;
    for(let i = 0; i < this.players.length; i++){
      if(!this.players[i].human){
        seatsAvailable++;
      }
    }

    return seatsAvailable;
  }

  start(){
    if(this.status == "Playing"){
      return false;
    }

    this._activePlayed = false;
    this.board.center = null;
    this.turn = 1;

    if(!this._multiplayer){
      this._shuffle(5);
    }

    this.deal();

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

    this.status = "Playing";
    this._statusChange.next(this.status);

    this.waitForPlay();
  }

  playLeft(domino: Domino, notify: boolean = true): boolean{
    if(!this.canPlayLeft(domino)){
      return false;
    }

    let dominoIndex = this.players[this._activePlayer].hand.indexOf(domino);
    let validPlay = dominoIndex >= 0 && this.board.playLeft(domino);
    if(validPlay){
      if(notify){
        this._playMade.next({domino: domino, position: "left"});
      }

      this.players[this._activePlayer].hand.splice(dominoIndex,1);
      this._activePlayed = true;
      this._endTurn();
    }

    return validPlay;
  }

  playRight(domino: Domino, notify: boolean = true): boolean{
    if(!this.canPlayRight(domino)){
      return false;
    }

    let dominoIndex = this.players[this._activePlayer].hand.indexOf(domino);
    let validPlay = dominoIndex >= 0 && this.board.playRight(domino);
    if(validPlay){
      if(notify){
        this._playMade.next({domino: domino, position: "right"});
      }

      this.players[this._activePlayer].hand.splice(dominoIndex,1);
      this._activePlayed = true;
      this._endTurn();
    }

    return validPlay;
  }

  pass(notify: boolean = true): boolean{
    if(this.canEndTurn()){
      if(notify){
        this._playMade.next({domino: null, position: "pass"});
      }

      this._endTurn();
      return true;
    }else{
      return false;
    }
  }

  canPlayLeft(domino: Domino){
    if(!domino){
      return false;
    }

    if(this._firstGame && this.turn == 1){
      return domino.value[0] == 6 && domino.value[1] == 6;
    }else{
      return !this._activePlayed && this.board.canPlayLeft(domino);
    }
  }

  canPlayRight(domino: Domino){
    if(!domino){
      return false;
    }

    if(this._firstGame && this.turn == 1){
      return domino.value[0] == 6 && domino.value[1] == 6;
    }else{
      return !this._activePlayed && this.board.canPlayRight(domino);
    }
  }

  canEndTurn(){
    return this._activePlayed || this._getValidPlays(this.players[this._activePlayer]) == 0;
  }

  getActivePlayer(){
    return this.players[this._activePlayer];
  }

  statusChanged(): Observable<string>{
    return this._statusChange;
  }

  playMade(): Observable<{domino: Domino, position: string}>{
    return this._playMade;
  }

  isShut(){
    let isShut: boolean = true;
    for(let player of this.players){
      isShut = isShut && (this._getValidPlays(player) == 0);
    }

    return this.getActivePlayer().hand.length > 0 && isShut;
  }

  isWatching(){
    let isWatching: boolean = true;
    for(let i=0; i < this.players.length; i++){
      isWatching = isWatching && (this.players[i].remote);
    }

    return isWatching;
  }

  isMultiplayer(): boolean{
    return this._multiplayer;
  }

  waitForPlay(){
    if(!this._auto){
      return false;
    }

    console.log(this.players)
    if(this.canEndTurn()){
      setTimeout(() => {
        this.pass();
      },2000)
    }else if(!this.getActivePlayer().human){
      let turn = this.turn;
      setTimeout(() => {
        this._aiTurn(turn);
      },2000)
    }else if(this.getActivePlayer().remote){
      this._runPlayClock(this.turn,this.activePlayer,this._timeout + 5);
    }else{
      this._runPlayClock(this.turn,this.activePlayer,this._timeout);
    }
  }

  private _endTurn(){
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
        }else{
          this.status = "Drawn";
        }

        this._endRound();
      }else{
        this._activePlayer = (this._activePlayer + 1) % this.players.length;
        this._activePlayed = false;
        this.turn += 1;

        this.waitForPlay();
      }
    }
  }

  private _endRound(){
    if(this.type == "push"){
      this.status = "Completed";
    }else if(this.status !== "Drawn"){
      this.getActivePlayer().role = "Witness";
      this.getActivePlayer().score += 1;

      this._firstGame = false;
      this.status = "Intermission";

      //Check if everyone has come out of jail
      let squash: boolean = true;
      for(let i = 0; i < this.players.length; i++){
        squash = squash && (this.players[i].score > 0);
      }

      if(squash){
        this.status = "Squashed";
      //Check if the active player has jailed someone
      }else if(this.getActivePlayer().score == this.playTo){
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

  public deal(){
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

  private _aiTurn(turn: number){
    if(turn !== this.turn){
      return false;
    }

    let played: boolean = false;

    for(let domino of this.getActivePlayer().hand){
      if(this.playLeft(domino) || this.playRight(domino)){
        played = true;
        break;
      }
    }
  }

  private _runPlayClock(turn: number, activePlayer: number, timeLeft: number){
    if(this.activePlayer !== activePlayer){
      return;
    }else if(timeLeft == 0){
      this._aiTurn(turn);
    }else{
      this.playClock = timeLeft;
      setTimeout(() => {
        this._runPlayClock(turn, activePlayer, timeLeft - 1);
      },1000)
    }
  }
}
