import {Component} from '@angular/core';

import {
  FormControl,
  FormGroup
} from '@angular/forms';

@Component({
  selector: 'form2',
  template: `
  <div>
    <form (submit)="onSubmit(myform)" class="col-sm-8">
      <div class="form-group">
        <label>Description</label>
        <input type="text" [(ngModel)]="myform.description" name="description"
          required class="form-control" />
      </div>
      <div class="form-group">
        <label>Points</label>
        <input type="number" min="1" max="10" step="1" required name="points"
          [(ngModel)]="myform.points" class="form-control" />
      </div>
      <div class="form-group">
      <label>Status</label>
      <select [(ngModel)]="myform.status" class="form-control" name="status">
        <option value="0">Pending</option>
        <option value="1">Started</option>
        <option value="2">Finished</option>
        <option value="3">Overdue</option>
      </select>
      </div>
      <div class="form-group">
      <label>Priority</label>
      <select [(ngModel)]="myform.priority"
       class="form-control" name="priority">
        <option value="0">Low</option>
        <option value="1">Medium</option>
        <option value="2">High</option>
      </select>
      </div>
      <div class="form-group">
      <label>Date</label>
      <input type="date" [(ngModel)]="myform.targetDate"
       class="form-control" name="targetDate" />
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
