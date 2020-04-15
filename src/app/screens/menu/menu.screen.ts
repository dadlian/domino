import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl:"./menu.screen.html",
  styleUrls:["./menu.screen.scss"]
})
export class MenuScreen{
  constructor(private _router: Router){
  }

  ngOnInit(){
  }

  soloPlay(){
    this._router.navigate(["/game"]);
  }
}
