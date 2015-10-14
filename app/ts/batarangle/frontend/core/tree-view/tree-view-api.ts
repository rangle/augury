import {List} from 'immutable';

export class ComponentTree {
  private json = [{
    eventType: 'added',
    component: {
      ref: '0#0',
      id: '0.0',
      name: 'TodoList',
      properties: {
        name: "ada",
        key2: 2341,
        key3: "pasdasd"
      }
    }
  }, {
      eventType: 'added',
      component: {
        ref: '0#1',
        id: '0.0.0',
        name: 'TodoItem',
        properties: {
          name: "adsa",
          key2: 2341,
          key3: "pasdasd"
        }
      }
    }, {
      eventType: 'added',
      component: {
        ref: '0#1',
        id: '0.0.1',
        name: 'TodoItem',
        properties: {
          name: "adsa",
          key2: 2341,
          key3: "pasdasd"
        }
      }
    }, {
      eventType: 'added',
      component: {
        ref: '0#1',
        id: '0.0.2',
        name: 'TodoItem',
        properties: {
          name: "adsa",
          key2: 2341,
          key3: "pasdasd"
        }
      }
    }, {
      eventType: 'added',
      component: {
        ref: '0#1#3',
        id: '0.0.2.0',
        name: 'TodoItemCalendar',
        properties: {
          name: "adsa",
          key2: 2341,
          key3: "pasdasd"
        }
      }
    }];


  add(component, node, level) {
    let levelId = component.id.split('.');
    if (level === levelId.length - 1) {
      component.children = List();
      node.children = node.children.push(component);
    } else {
      node.children = node.children.set(
        levelId[level],
        this.add(component, node.children.get(levelId[level]), level + 1)
        );
    }
    return node;
  }

  private _componentTree: List<any>;
  
  constructor() {
    this._componentTree = List.of({
      name: "root",
      children: List()
    });
    
    console.log('json: ', this.json);
    
    this.json.forEach(elem => {
      switch (elem.eventType) {
        case 'added':
          this._componentTree = this._componentTree.set(0, this.add(elem.component, this._componentTree.get(0), 1));
          break;
        case 'removed':
          break;
        case 'moved':
          break;
        case 'changed':
          break;
        default:
          break;
      }
    });
  }
  
  get componentTree() { return this._componentTree; }
}