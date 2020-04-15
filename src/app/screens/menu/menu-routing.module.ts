import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuScreen } from './menu.screen';

const routes: Routes = [
  {
    path: "",
    component: MenuScreen
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuScreenRoutingModule { }
