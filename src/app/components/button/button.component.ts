import { Component, Input } from '@angular/core';

@Component({
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
  selector: "jn-button"
})
export class ButtonComponent{
  @Input("label") label: string;

  constructor(){}
}
