
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
        <form [ngFormModel]="myForm2" (ngSubmit)="onSubmit(myForm2.value)"
           class="col-sm-8">
            <div class="form-group">
                <label>SKU</label>
            </div>
            <div class="form-group">
                <input type="text" id="skuInput" placeholder="SKU"
                  class="form-control"
                  [ngFormControl]="myForm2.controls['sku']">
            </div>
            <div class="form-group">
                <input type="text" id="skuInput" placeholder="SKU"
                  class="form-control"
                  [ngFormControl]="myForm2.controls['sku2']">
            </div>
            <button type="submit" class="btn btn-success">Submit</button>
        </form>
    </div>

`
})
export default class ControlForm {
  myForm2: ControlGroup;

  constructor(fb: FormBuilder) {
    this.myForm2 = fb.group({
      'sku': ['ABC123'],
      'sku2': 'sku2aa'
    });
  }

  onSubmit(value: string): void {
    console.log('you submitted value: ', value);
  }
}
