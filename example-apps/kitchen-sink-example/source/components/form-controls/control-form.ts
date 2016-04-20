
import { Component } from 'angular2/core'; import {
  FORM_DIRECTIVES,
  FormBuilder,
  ControlGroup
} from 'angular2/common';
@Component({
  selector: 'control-form',
  directives: [FORM_DIRECTIVES],
  template: `
    <div>
        <form [ngFormModel]="formControl" 
           (ngSubmit)="onSubmit(formControl.value)"
           class="col-sm-8">
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="name" placeholder="Name"
                  class="form-control"
                  [ngFormControl]="formControl.controls['name']">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="text" id="email" placeholder="Email"
                  class="form-control"
                  [ngFormControl]="formControl.controls['email']">
            </div>
            <button type="submit" class="btn btn-success">Submit</button>
        </form>
    </div>
`
})
export default class ControlForm {
  formControl: ControlGroup;

  constructor(fb: FormBuilder) {
    this.formControl = fb.group({
      'name': ['John Doe'],
      'email': 'johndoe@gmail.com'
    });
  }

  onSubmit(value: string): void {
    console.log('you submitted value: ', value);
  }
}
