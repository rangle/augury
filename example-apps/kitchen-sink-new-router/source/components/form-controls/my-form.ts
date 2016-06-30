import {Component} from '@angular/core';
import {FORM_DIRECTIVES} from '@angular/common';
import {NgForm} from '@angular/common';

@Component({
  selector: 'my-form',
  template: `
    <form #regForm="ngForm" (ngSubmit)="onSubmit(regForm)"
      novalidate class="col-sm-8">

      <div class="control-group">
        <label for="email">Email:</label>
        <input class="form-control" type="email"
         id="email" ngControl="email">
      </div>

      <div class="control-group">
        <label for="password">Password:</label>
        <input class="form-control" type="password"
         id="password" ngControl="password">
      </div>
      <br/>
      <div class="control-group">
        <button class="btn btn-success"
          type="submit">Register</button>
      </div>

    </form>
  `,
  directives: [FORM_DIRECTIVES]
})
export default class MyForm {
  onSubmit(regForm: NgForm) {
    console.log(regForm.value);
  }
}
