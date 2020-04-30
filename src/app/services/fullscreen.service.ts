import { Injectable } from '@angular/core';

const docOpen = document.documentElement as HTMLElement & {
  mozRequestFullScreen(): Promise<void>;
  webkitRequestFullScreen(): Promise<void>;
  msRequestFullscreen(): Promise<void>;
};

const docClose = document as Document & {
  mozCancelFullScreen(): Promise<void>;
  webkitExitFullscreen(): Promise<void>;
  msExitFullscreen(): Promise<void>;
};

@Injectable()
export class FullScreenService{
  openFullScreen() {
    let requestFullScreen = docOpen.requestFullscreen || docOpen.mozRequestFullScreen || docOpen.webkitRequestFullScreen || docOpen.msRequestFullscreen;
    requestFullScreen.call(docOpen);
  }

  closeFullScreen(){
    let cancelFullScreen = docClose.exitFullscreen || docClose.mozCancelFullScreen || docClose.webkitExitFullscreen || docClose.msExitFullscreen;
    cancelFullScreen.call(docClose);
  }
}
