import {Component, Input, ChangeDetectionStrategy}
  from 'angular2/core';
import {User} from './user';

@Component({
  selector: 'user-info-checkonce',
  changeDetection: ChangeDetectionStrategy.CheckOnce,
  styles: [`
    .bg {
      background-color: red;
    }
  `],
  template: `
    <div [ngClass]="{'bg' : user.isOnline}">
      <h4>User Info CheckOnce</h4>
      <p>
        <label>User Id: {{user.id}} {{user.isOnline}}</label>
      </p>
    </div>`
})
export class UserInfoCheckOnce {
  @Input() user: User;
}
