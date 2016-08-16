import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'aux-comp',
  template: `
  <div>
    <h3>Hello There!!</h3>
    <h4>Message: {{message}}</h4>
    <h4>Name: {{name}}</h4>
  </div>
  `
})
export default class RouterData2 {
  public message: string;
  public name: string;
  private params$: any;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    const name = 'name';
    const message = 'message';
    this.params$ = this.activatedRoute.params.subscribe(params => {
      this.name = params[name];
      this.message = params[message];
    });
  }

  ngOnDestroy() {
    this.params$.unsubscribe();
  }
}
