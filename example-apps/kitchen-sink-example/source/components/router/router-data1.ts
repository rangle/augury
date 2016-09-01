import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'aux-comp',
  template: `
  <div>
    <h3>Hello There!!</h3>
    <h4>Message: {{message}}</h4>
    <h4>Data: {{data}}</h4>
  </div>
  `
})
export default class RouterData1 {
  public message: string;
  public data: string;
  private params$: any;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    const name = 'name';
    this.params$ = this.activatedRoute.params.subscribe(params => {
      this.message = params[name];
    });
  }

  ngOnDestroy() {
    this.params$.unsubscribe();
  }

}
