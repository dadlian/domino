import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameScreenRoutingModule } from './game-routing.module';
import { GameScreen } from './game.screen';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    GameScreenRoutingModule,
    ComponentsModule,
    CommonModule
  ],
  declarations: [
    GameScreen,
  ],
  providers:[
  ]
})
export class GameScreenModule{}
