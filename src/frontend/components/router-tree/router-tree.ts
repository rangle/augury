import {Component, AfterViewInit} from 'angular2/core';

import {UserActions} from '../../actions/user-actions/user-actions';

console.log('hello there');

@Component({
  selector: 'bt-router-tree',
  inputs: ['routerTree'],
  templateUrl:
    '/src/frontend/components/router-tree/router-tree.html'
})
export default class RouterTree {

}
