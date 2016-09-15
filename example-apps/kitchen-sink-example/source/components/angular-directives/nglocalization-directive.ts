import {Component} from '@angular/core';

@Component({
  selector: 'nglocalization-directive',
  template: `
    <h4>Value = {{value}}</h4>
    <button class="btn btn-warning" (click)="inc()">Increment</button>
    <h4 [ngPlural]="value">
      <template ngPluralCase="=0">there is nothing</template>
      <template ngPluralCase="=1">there is one</template>
      <template ngPluralCase="few">there are a few</template>
      <template ngPluralCase="other">there is some number</template>
    </h4>
  `,
})
export default class NgLocalizationDirective {
  value: any = 'init';
  inc() {
    this.value = this.value === 'init' ? 0 : this.value + 1;
  }
}
