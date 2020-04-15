import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: "",
    children:[
      {
        path: "",
        pathMatch: "full",
        redirectTo: "menu"
      },
      {
        path: 'menu',
        loadChildren: "./screens/menu/menu.module#MenuScreenModule"
      },
      {
        path: 'game',
        loadChildren: "./screens/game/game.module#GameScreenModule"
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
