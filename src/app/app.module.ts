import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { GameService } from './services/game.service';
import { FullScreenService } from './services/fullscreen.service';
import { GameGuard } from './guards/game.guard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [
    GameGuard,
    FullScreenService,
    GameService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
