import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Board } from '../../model/board.model';

@Component({
  selector:"jn-board",
  templateUrl:"./board.component.html",
  styleUrls:["./board.component.scss"]
})
export class BoardComponent{
  @ViewChild("canvas",{static:false}) canvas: ElementRef;
  @ViewChild("left",{static:false}) left: ElementRef;
  @ViewChild("right",{static:false}) right: ElementRef;
  @ViewChild("up",{static:false}) up: ElementRef;
  @ViewChild("down",{static:false}) down: ElementRef;

  @Input() board: Board;
  public leftFull: boolean;
  public rightFull: boolean;
  public upFull: boolean;
  public downFull: boolean;

  constructor(){
    this.board = new Board();
    this.reset();
  }

  ngAfterViewInit(){
    this.canvas.nativeElement.style.width = "25px";
  }

  reset(){
    this.leftFull = false;
    this.rightFull = false;
    this.upFull = false;
    this.downFull = false;

    if(this.canvas){
      this.canvas.nativeElement.style.width = "25px";
    }
  }

  getLeftDominos(){
    let width = 0;
    let leftDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.previous){
      leftDominos.push(currentDomino.previous);
      if(currentDomino.previous.isDouble()){
        width += 25;
      }else{
        width += 50;
      }

      if(width > 300 && (currentDomino.previous.isDouble() || !currentDomino.isDouble())){
        this.leftFull = true;
        break;
      }

      currentDomino = currentDomino.previous;
    }

    if(this.canvas && this.left && this.right){
      this.canvas.nativeElement.style.marginLeft = (this.right.nativeElement.offsetWidth- this.left.nativeElement.offsetWidth)+"px";
    }

    if(leftDominos.length > 0){
      this.canvas.nativeElement.style.width = "auto";
    }

    return leftDominos;
  }

  getRightDominos(){
    let width = 0;
    let rightDominos = [];

    let currentDomino = this.board.center;
    while(currentDomino && currentDomino.next){
      rightDominos.push(currentDomino.next);
      if(currentDomino.next.isDouble()){
        width += 25;
      }else{
        width += 50;
      }

      if(width > 300 && (currentDomino.next.isDouble() || !currentDomino.isDouble())){
        this.rightFull = true;
        break;
      }

      currentDomino = currentDomino.next;
    }

    if(this.canvas && this.left && this.right){
      this.canvas.nativeElement.style.marginLeft = (this.right.nativeElement.offsetWidth- this.left.nativeElement.offsetWidth)+"px";
    }

    if(rightDominos.length > 0){
      this.canvas.nativeElement.style.width = "auto";
    }

    return rightDominos;
  }

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

      if(width > 200 && (currentDomino.previous.isDouble() || !currentDomino.isDouble())){
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

      if(width > 200 && (currentDomino.next.isDouble() || !currentDomino.isDouble())){
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
  }
}
