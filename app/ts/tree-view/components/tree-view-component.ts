import {bootstrap, Component, View} from 'angular2/angular2';

@Component({
  selector: 'tree-view'
})
@View({
  template: `
    <span>{{ message }}</span>
    `
})
export class TreeView {
  
  private _message: String;
  
  get message() {
    return this._message;
  }
  
  constructor() {
    this._message = 'I am a Tree View of Components';
  }
}

bootstrap(TreeView);