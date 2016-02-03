
import { Component } from 'angular2/core'; import {
  FORM_DIRECTIVES,
  FormBuilder,
  ControlGroup
} from 'angular2/common';
@Component({
  selector: 'control-form',
  directives: [FORM_DIRECTIVES],
  template: `
  <div class="ui raised segment">
<h2 class="ui header">Demo Form: Sku with Builder</h2>
<form [ngFormModel]="myForm2"
          (ngSubmit)="onSubmit(myForm2.value)"
          class="ui form">
      <div class="field">
<label for="skuInput">SKU</label>
<input
  type="text"
  id="skuInput"
  placeholder="SKU"
  [ngFormControl]="myForm2.controls['sku']"
>
<input
  type="text"
  id="skuInput"
  placeholder="SKU"
  [ngFormControl]="myForm2.controls['sku2']"
>
  </div>
<button type="submit" class="ui button">Submit</button>
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
} }


// import {Component} from 'angular2/core';
// import {FORM_DIRECTIVES} from 'angular2/common';
// import {NgForm, Control} from 'angular2/common';

// // @Component({
// //   selector: 'control-form',
// //   template: `
// //     <form class="col-sm-8">

// //       <div class="control-group">
// //         <label for="name">Name:</label>
// //         <input type="text" ngControl="name" />
// //       </div>

// //       <div class="control-group">
// //         <button class="btn btn-success"
// //           type="submit">Register</button>
// //       </div>

// //     </form>
// //   `,
// //   directives: [FORM_DIRECTIVES]
// // })

// @Component({
// selector: 'control-form', directives: [FORM_DIRECTIVES], template: `
// <div class="ui raised segment">
// <h2 class="ui header">Demo Form: Sku</h2>
// <form #f="ngForm" (ngSubmit)="onSubmit(f.value)" class="ui form">
//   <div class="field">
//       Forms in Angular
//    <label for="skuInput">SKU</label>
//   <input type="text" id="skuInput" placeholder="SKU" ngControl="sku">
// </div>
// <button type="submit" class="ui button">Submit</button> </form>
// </div>
// ` })
// export default class ControlForm {

//   onSubmit(value: string): void {
//     console.log('you submitted value: ', value);
//   }

//   // constructor() {
//   //   let nameControl: Control = new Control('Nate');
//   //   let name = nameControl.value; // -> Nate
//   // }


//   // onSubmit(regForm: NgForm) {
//   //   console.log(regForm.value);
//   // }
// }
