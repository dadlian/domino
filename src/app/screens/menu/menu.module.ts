import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuScreenRoutingModule } from './menu-routing.module';
import { MenuScreen } from './menu.screen';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    MenuScreenRoutingModule,
    ComponentsModule,
    CommonModule
  ],
  declarations: [
    MenuScreen,
  ],
  providers:[
  ]
})
export class MenuScreenModule{}
