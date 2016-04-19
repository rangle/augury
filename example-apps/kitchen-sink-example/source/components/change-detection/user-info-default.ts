import {Component, Input, ChangeDetectionStrategy}
  from 'angular2/core';
import {User} from './user';

@Component({
  selector: 'user-info-default',
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [`
    .bg {
      background-color: red;
    }
  `],
  template: `
    <div [ngClass]="{'bg' : user.isOnline}">
      <h4>User Info Default</h4>
      <p>
        <label>User Id: {{user.id}} {{user.isOnline}}</label>
      </p>
    </div>`
})
export class UserInfoDefault {
  @Input() user: User;
}
