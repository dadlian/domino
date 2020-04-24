import { Directive, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[position]'
})
export class PositionDirective {
  @Input() position: string;
  constructor(private _el: ElementRef){
    this.position = "";
  }

  ngOnInit(){
   this._el.nativeElement.className = this.position;
  }
}
