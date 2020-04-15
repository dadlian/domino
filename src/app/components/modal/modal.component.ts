import { Component, Input } from '@angular/core';

@Component({
  "templateUrl":"./modal.component.html",
  "styleUrls":["./modal.component.scss"],
  "selector":"jn-modal"
})
export class ModalComponent{
  public visible: boolean;

  constructor(){
    this.visible = false;
  }

  ngOnInit(){
  }

  show(){
    this.visible = true;
    document.body.style.overflow = "hidden";
  }

  hide(){
    this.visible = false;
    document.body.style.overflow = "auto";
  }
}
