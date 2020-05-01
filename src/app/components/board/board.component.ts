import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Board } from '../../model/board.model';
import { Domino } from '../../model/domino.model';

@Component({
  selector:"jn-board",
  templateUrl:"./board.component.html",
  styleUrls:["./board.component.scss"]
})
export class BoardComponent{
  @ViewChild("canvas",{static:false}) canvas: ElementRef;
  @ViewChild("up",{static:false}) up: ElementRef;
  @ViewChild("down",{static:false}) down: ElementRef;

  @Input() board: Board;
  public upFull: boolean;
  public downFull: boolean;

  private _verticalCapacity: number;

  constructor(){
    this.board = new Board();
    this.reset();
    this._verticalCapacity = 0;
  }

  ngAfterViewInit(){
    this._verticalCapacity = (window.innerHeight - 145)/2 - 25;
  }

  reset(){
    this.upFull = false;
    this.downFull = false;
  }

  getUpDominos(){
    let height = 0;
    let upDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.next){
      if(currentDomino.next.isDouble()){
        height += 25;
      }else{
        height += 50;
      }

      if(height <= this._verticalCapacity){
        upDominos.push(currentDomino.next);
      }else if(!currentDomino.next.isDouble() && height - 25 <= this._verticalCapacity){
        this.upFull = true;
        height -= 25;
        upDominos.push(currentDomino.next);
      }else{
        this.upFull = true;
        break;
      }

      currentDomino = currentDomino.next;
    }

    if(this.canvas && this.up && this.down){
      this.canvas.nativeElement.style.marginTop = (this.down.nativeElement.offsetHeight - this.up.nativeElement.offsetHeight)+"px";
    }

    return upDominos;
  }

  getRemainingUpDominos(){
    let remainingDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.next){
      if(this.getUpDominos().indexOf(currentDomino.next) >= 0){
        currentDomino = currentDomino.next;
        continue;
      }

      remainingDominos.push(currentDomino.next);
      currentDomino = currentDomino.next;
    }

    return remainingDominos;
  }

  getDownDominos(){
    let height = 0;
    let downDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.previous){
      if(currentDomino.previous.isDouble()){
        height += 25;
      }else{
        height += 50;
      }

      if(height <= this._verticalCapacity){
        downDominos.push(currentDomino.previous);
      }else if(!currentDomino.previous.isDouble() && height - 25 <= this._verticalCapacity){
        this.downFull = true;
        height -= 25;
        downDominos.push(currentDomino.previous);
      }else{
        this.downFull = true;
        break;
      }

      currentDomino = currentDomino.previous;
    }

    if(this.canvas && this.up && this.down){
      this.canvas.nativeElement.style.marginTop = (this.down.nativeElement.offsetHeight - this.up.nativeElement.offsetHeight)+"px";
    }

    return downDominos;
  }

  getRemainingDownDominos(){
    let remainingDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.previous){
      if(this.getDownDominos().indexOf(currentDomino.previous) >= 0){
        currentDomino = currentDomino.previous;
        continue;
      }

      remainingDominos.push(currentDomino.previous);
      currentDomino = currentDomino.previous;
    }

    return remainingDominos;
  }

  isUpDouble(index: number, domino: Domino){
    if(this.upFull){
      let upCount = this.getUpDominos().length;
      return index == upCount - 1 || (domino.isDouble() && index !== upCount -2);
    }else{
      return domino.isDouble();
    }
  }

  isDownDouble(index: number, domino: Domino){
    if(this.downFull){
      let downCount = this.getDownDominos().length;
      return index == downCount - 1 || (domino.isDouble() && index !== downCount -2);
    }else{
      return domino.isDouble();
    }
  }
}
