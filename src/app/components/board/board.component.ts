import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Board } from '../../model/board.model';

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
    this._verticalCapacity = (window.innerHeight - 185)/2 - 25;
    console.log(this._verticalCapacity);
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
      }else{
        this.upFull = true;
        break;
      }

      currentDomino = currentDomino.next;
    }

    if(this.canvas && this.up && this.down){
      this.canvas.nativeElement.style.marginBottom = (this.up.nativeElement.offsetHeight - this.down.nativeElement.offsetHeight)+"px";
    }

    return upDominos;
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
      }else{
        this.upFull = true;
        break;
      }

      currentDomino = currentDomino.previous;
    }

    if(this.canvas && this.up && this.down){
      this.canvas.nativeElement.style.marginBottom = (this.up.nativeElement.offsetHeight - this.down.nativeElement.offsetHeight)+"px";
    }

    return downDominos;
  }

  /*

  getUpDominos(){
    let width = 0;
    let upDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.previous){
      if(this.getLeftDominos().indexOf(currentDomino.previous) >= 0){
        currentDomino = currentDomino.previous;
        continue;
      }

      upDominos.push(currentDomino.previous);
      if(currentDomino.previous.isDouble()){
        width += 25;
      }else{
        width += 50;
      }

      if(width > 150 && (currentDomino.previous.isDouble() || !currentDomino.isDouble())){
        this.upFull = true;
        break;
      }

      currentDomino = currentDomino.previous;
    }

    if(this.canvas && this.up && this.down){
      this.canvas.nativeElement.style.marginTop = (this.down.nativeElement.offsetHeight - this.up.nativeElement.offsetHeight)+"px";
    }

    return upDominos;
  }

  getDownDominos(){
    let width = 0;
    let downDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.next){
      if(this.getRightDominos().indexOf(currentDomino.next) >= 0){
        currentDomino = currentDomino.next;
        continue;
      }

      downDominos.push(currentDomino.next);
      if(currentDomino.next.isDouble()){
        width += 25;
      }else{
        width += 50;
      }

      if(width > 150 && (currentDomino.next.isDouble() || !currentDomino.isDouble())){
        this.downFull = true;
        break;
      }

      currentDomino = currentDomino.next;
    }

    if(this.canvas && this.up && this.down){
      this.canvas.nativeElement.style.marginTop = (this.down.nativeElement.offsetHeight - this.up.nativeElement.offsetHeight)+"px";
    }

    return downDominos;
  }

  getTopDominos(){
    let topDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.previous){
      if(this.getLeftDominos().indexOf(currentDomino.previous) >= 0 || this.getUpDominos().indexOf(currentDomino.previous) >= 0){
        currentDomino = currentDomino.previous;
        continue;
      }

      topDominos.push(currentDomino.previous);
      currentDomino = currentDomino.previous;
    }

    return topDominos;
  }

  getBottomDominos(){
    let bottomDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.next){
      if(this.getRightDominos().indexOf(currentDomino.next) >= 0 || this.getDownDominos().indexOf(currentDomino.next) >= 0){
        currentDomino = currentDomino.next;
        continue;
      }

      bottomDominos.push(currentDomino.next);
      currentDomino = currentDomino.next;
    }

    return bottomDominos;
  }*/
}
