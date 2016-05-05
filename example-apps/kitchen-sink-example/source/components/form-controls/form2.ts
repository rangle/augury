import {Component} from 'angular2/core';
import {FORM_DIRECTIVES} from 'angular2/common';
import {ROUTER_DIRECTIVES, RouterLink, RouteParams, Router}
from 'angular2/router';

import {Location} from 'angular2/router';

@Component({
  selector: 'form2',
  directives: [FORM_DIRECTIVES, RouterLink, ROUTER_DIRECTIVES],
  template: `
  <div>
    <form (ngSubmit)="onSubmit(myform)" class="col-sm-8">
      <div class="form-group">
        <label>Description</label>
        <input type="text" [(ngModel)]="myform.description"
          required class="form-control" />
      </div>
      <div class="form-group">
        <label>Points</label>
        <input type="number" min="1" max="10" step="1" required
          [(ngModel)]="myform.points" class="form-control" />
      </div>
      <div class="form-group">
      <label>Status</label>
      <select [(ngModel)]="myform.status" class="form-control" >
        <option value="0">Pending</option>
        <option value="1">Started</option>
        <option value="2">Finished</option>
        <option value="3">Overdue</option>
      </select>
      </div>
      <div class="form-group">
      <label>Priority</label>
      <select [(ngModel)]="myform.priority" class="form-control">
        <option value="0">Low</option>
        <option value="1">Medium</option>
        <option value="2">High</option>
      </select>
      </div>
      <div class="form-group">
      <label>Date</label>
      <input type="date" [(ngModel)]="myform.targetDate" class="form-control" />
      </div>
      <input type="submit" value="Save" class="btn btn-success" />
    </form>
  </div>
  `
})
export default class Form2 {

  public myform: any = {};

  onSubmit(myform: any) {
    console.log(myform);
  }

}
