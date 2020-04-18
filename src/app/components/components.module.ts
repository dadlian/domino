import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DominoComponent } from './domino/domino.component';
import { PlayerComponent } from './player/player.component';
import { BoardComponent } from './board/board.component';
import { ModalComponent } from './modal/modal.component';
import { SummaryComponent } from './summary/summary.component';
import { ButtonComponent } from './button/button.component';

export { DominoComponent } from './domino/domino.component';
export { PlayerComponent } from './player/player.component';
export { BoardComponent } from './board/board.component';
export { ModalComponent } from './modal/modal.component';
export { SummaryComponent } from './summary/summary.component';
export { ButtonComponent } from './button/button.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    DominoComponent,
    PlayerComponent,
    BoardComponent,
    ModalComponent,
    SummaryComponent,
    ButtonComponent
  ],
  providers:[
  ],
  exports:[
    DominoComponent,
    PlayerComponent,
    BoardComponent,
    ModalComponent,
    SummaryComponent,
    ButtonComponent
  ]
})
export class ComponentsModule{}
