import {Component, Output, EventEmitter, OnChanges, Input}
  from 'angular2/core';

@Component({
  selector: 'bt-injector-tree',
  templateUrl:
    '/src/frontend/components/injector-tree/injector-tree.html'
})
export default class InjectorTree implements OnChanges {

  @Input() tree: any;
  private flattenedTree: any;

  ngOnChanges() {
    if (this.tree) {
      this.displayTree();
    }
  }

  private flatten(list: Array<any>) {
    return list.reduce((a, b) => {
      return a.concat(Array.isArray(b.children) ?
        [this.copyParent(b), ...this.flatten(b.children)] : b);
    }, []);
  }

  private copyParent(p: Object) {
    return Object.assign({}, p, { children: undefined });
  }

  private displayTree() {
     this.flattenedTree = this.flatten(this.tree);
  }

}
