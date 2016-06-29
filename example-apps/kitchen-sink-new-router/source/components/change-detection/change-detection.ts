import {Component} from '@angular/core';

import {User} from './user';
import {UserInfoDefault} from './user-info-default';
import {UserInfoPush} from './user-info-push';
import {UserInfoCheckOnce} from './user-info-checkonce';

@Component({
  selector: 'change-detection',
  directives: [UserInfoDefault, UserInfoPush, UserInfoCheckOnce],
  template: `
  <div>
    <button type="button" class="btn btn-danger"
      (click)="reset()">
      Reset
    </button>

    <button type="button" class="btn btn-primary"
      (click)="makeUserOnline(0)">
      Make User Online (muttable)
    </button>

    <button type="button" class="btn btn-success"
      (click)="makeUserOnline(1)">
      Make User Online (imuttable)
    </button>

    <user-info-default [user]="user">
    </user-info-default>

    <user-info-push [user]="user">
    </user-info-push>

    <user-info-checkonce [user]="user">
    </user-info-checkonce>


  </div>
  `
})
export default class ChangeDetection {
  private user = new User(1, 'John Doe', 'john@doe.com');

  reset() {
    this.user = new User(1, 'John Doe', 'john@doe.com');
  }

  makeUserOnline(type: number) {
    if (type === 0) {
      this.user.isOnline = true;
    } else if (type === 1) {
      this.user = Object.assign({}, this.user, {isOnline: true});
    }
  }
}
