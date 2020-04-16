import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { GameService } from './services/game.service';
import { GameGuard } from './guards/game.guard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [
    GameGuard,
    GameService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
