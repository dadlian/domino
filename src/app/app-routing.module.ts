import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameGuard } from './guards/game.guard';


const routes: Routes = [
  {
    path: "",
    children:[
      {
        path: '',
        loadChildren: "./screens/menu/menu.module#MenuScreenModule"
      },
      {
        path: 'game',
        loadChildren: "./screens/game/game.module#GameScreenModule",
        canActivate:[ GameGuard ]
      },
      {
        path: "",
        pathMatch: "full",
        redirectTo: ""
      },
      {
        path: "**",
        redirectTo: ""
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
