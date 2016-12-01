import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular Input Output';
  count: number;

  @Input() message = "Jumbo Shrimp!";

  onCountEvent(data) {
    this.count = data;
  }

  onMessageEvent(data) {
    this.message = data;
    console.log(data);
  }
}
