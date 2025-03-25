import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { TimelineComponent } from './timeline/timeline.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, TimelineComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'checkin';
}
