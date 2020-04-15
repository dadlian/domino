import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameScreen } from './game.screen';

const routes: Routes = [
  {
    path: "",
    component: GameScreen
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameScreenRoutingModule { }
