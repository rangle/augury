import {Component, Input, ChangeDetectionStrategy}
  from 'angular2/core';
import {User} from './user';

@Component({
  selector: 'user-info-push',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .bg {
      background-color: red;
    }
  `],
  template: `
    <div [ngClass]="{'bg' : user.isOnline}">
      <h2>User Info OnPush</h2>
      <p>
        <label>User Id: {{user.id}} {{user.isOnline}}</label>
      </p>
    </div>`
})
export class UserInfoPush {
  @Input() user: User;
}
