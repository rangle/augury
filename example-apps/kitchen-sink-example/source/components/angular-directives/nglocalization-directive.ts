import {Component, provide} from 'angular2/core';
import {NgPlural, NgPluralCase, NgLocalization} from 'angular2/common';

class MyLocalization extends NgLocalization {
   getPluralCategory(value: any) {
      if (value < 5) {
         return 'few';
      }
   }
}
@Component({
   selector: 'nglocalization-directive',
   providers: [provide(NgLocalization, {useClass: MyLocalization})],
  template: `
    <p>Value = {{value}}</p>
    <button class="btn btn-primary" (click)="inc()">Increment</button>
    <div [ngPlural]="value">
      <template ngPluralCase="=0">there is nothing</template>
      <template ngPluralCase="=1">there is one</template>
      <template ngPluralCase="few">there are a few</template>
      <template ngPluralCase="other">there is some number</template>
    </div>
  `,
  directives: [NgPlural, NgPluralCase]
})
export default class NgLocalizationDirective {
  value: any = 'init';
  inc() {
    this.value = this.value === 'init' ? 0 : this.value + 1;
  }
}
