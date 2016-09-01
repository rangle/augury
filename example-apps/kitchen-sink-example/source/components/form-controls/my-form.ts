import {Component} from '@angular/core';

import {FORM_PROVIDERS, REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup}
 from '@angular/forms';

@Component({
  selector: 'my-form',
  providers: [FORM_PROVIDERS],
  directives: [REACTIVE_FORM_DIRECTIVES],
  template: `
    <form (submit)="onSubmit()"
      novalidate class="col-sm-8">

      <div class="control-group">
        <label for="email">Email:</label>
        <input class="form-control" type="email"
         id="email" [formControl]="email">
      </div>

      <div class="control-group">
        <label for="password">Password:</label>
        <input class="form-control" type="password"
         id="password" [formControl]="password">
      </div>
      <br/>
      <div class="control-group">
        <button class="btn btn-success"
          type="submit">Register</button>
      </div>

    </form>
  `
})
export default class MyForm {
  private email: FormControl = new FormControl();
  private password: FormControl = new FormControl();
  onSubmit() {
    console.log(this.email, this.password);
  }
}
