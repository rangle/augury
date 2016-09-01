
import { Component } from '@angular/core';

import {FORM_PROVIDERS, REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup}
 from '@angular/forms';

@Component({
  selector: 'control-form',
  directives: [REACTIVE_FORM_DIRECTIVES],
  providers: [FORM_PROVIDERS],
  template: `
    <div>
        <form (submit)="onSubmit(formControl.value)"
           class="col-sm-8">
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="name" placeholder="Name"
                  class="form-control"
                  [formControl]="formGroup.controls['name']">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="text" id="email" placeholder="Email"
                  class="form-control"
                  [formControl]="formGroup.controls['email']">
            </div>
            <button type="submit" class="btn btn-success">Submit</button>
        </form>
    </div>
`
})
export default class ControlForm {
  formGroup: FormGroup;

  constructor() {
    this.formGroup = new FormGroup({
      'name': new FormControl('John Doe'),
      'email': new FormControl('johndoe@gmail.com')
    });
  }

  onSubmit(value: string): void {
    console.log('you submitted value: ', value);
  }
}
