import * as test from 'tape';
import { AdapterEventType } from '../adapters/event_types';
import { AdapterEvent } from '../adapters/base';
import { Angular2Adapter } from '../adapters/angular2';

test('adapters/angular2: #addRoot', t => {
  t.plan(1);


  // Arrange
  const rootText = document.createTextNode('I am root!');
  const rootDiv = document.createElement('div');

  rootDiv.setAttribute('_ngcontent-hkq-0', '');
  rootDiv.appendChild(rootText);
  document.body.appendChild(rootDiv);

  const adapter = new Angular2Adapter();
  const htmlRoot = document.body.querySelector('[_ngcontent-hkq-0]');


  // Assert
  adapter.subscribe((evt: AdapterEvent) => {
    t.deepEqual(evt, {
      type: AdapterEventType.ROOT,
      node: htmlRoot
    }, 'emits root added event');
  });


  // Act
  adapter.addRoot(htmlRoot);


  // Cleanup
  document.body.removeChild(htmlRoot);
});

test('adapters/angular2: #addChild', t => {
  t.plan(1);


  // Arrange
  const rootText = document.createTextNode('I am root!');
  const childText = document.createTextNode('I am child!');
  const rootDiv = document.createElement('div');
  const childDiv =  document.createElement('span');

  rootDiv.setAttribute('_ngcontent-hkq-0', '');
  rootDiv.appendChild(rootText);
  childDiv.appendChild(childText);
  rootDiv.appendChild(childDiv);
  document.body.appendChild(rootDiv);

  const adapter = new Angular2Adapter();
  const htmlRoot = document.body.querySelector('[_ngcontent-hkq-0]');
  const htmlChild = htmlRoot.firstElementChild;


  // Assert
  adapter.subscribe((evt: AdapterEvent) => {
    t.deepEqual(evt, {
      type: AdapterEventType.ADD,
      node: htmlChild
    }, 'emits child added event');
  });


  // Act
  adapter.addChild(htmlChild);


  // Cleanup
  document.body.removeChild(htmlRoot);
});

test('adapters/angular2: #changeComponents', t => {
  t.plan(1);


  // Arrange
  const rootText = document.createTextNode('I am root!');
  const childText = document.createTextNode('I am child!');
  const rootDiv = document.createElement('div');
  const childDiv =  document.createElement('span');

  rootDiv.setAttribute('_ngcontent-hkq-0', '');
  rootDiv.appendChild(rootText);
  childDiv.appendChild(childText);
  rootDiv.appendChild(childDiv);
  document.body.appendChild(rootDiv);

  const adapter = new Angular2Adapter();
  const htmlRoot = document.body.querySelector('[_ngcontent-hkq-0]');
  const htmlChild = htmlRoot.firstElementChild;


  // Assert
  adapter.subscribe((evt: AdapterEvent) => {
    t.deepEqual(evt, {
      type: AdapterEventType.CHANGE,
      node: htmlChild
    }, 'emits element change event');
  });


  // Act
  adapter.changeComponent(htmlChild);


  // Cleanup
  document.body.removeChild(htmlRoot);
});

test('adapters/angular2: #removeRoot', t => {
  t.plan(1);


  // Arrange
  const rootText = document.createTextNode('I am root!');
  const childText = document.createTextNode('I am child!');
  const rootDiv = document.createElement('div');
  const childDiv =  document.createElement('span');

  rootDiv.setAttribute('_ngcontent-hkq-0', '');
  rootDiv.appendChild(rootText);
  childDiv.appendChild(childText);
  rootDiv.appendChild(childDiv);
  document.body.appendChild(rootDiv);

  const adapter = new Angular2Adapter();
  const htmlRoot = document.body.querySelector('[_ngcontent-hkq-0]');
  const htmlChild = htmlRoot.firstElementChild;


  // Assert
  adapter.subscribe((evt: AdapterEvent) => {
    t.deepEqual(evt, {
      type: AdapterEventType.REMOVE,
      node: htmlRoot
    }, 'emits element removed event');
  });


  // Act
  adapter.removeRoot(htmlRoot);


  // Cleanup
  document.body.removeChild(htmlRoot);
});

test('adapters/angular2: #removeChild', t => {
  t.plan(1);


  // Arrange
  const rootText = document.createTextNode('I am root!');
  const childText = document.createTextNode('I am child!');
  const rootDiv = document.createElement('div');
  const childDiv =  document.createElement('span');

  rootDiv.setAttribute('_ngcontent-hkq-0', '');
  rootDiv.appendChild(rootText);
  childDiv.appendChild(childText);
  rootDiv.appendChild(childDiv);
  document.body.appendChild(rootDiv);

  const adapter = new Angular2Adapter();
  const htmlRoot = document.body.querySelector('[_ngcontent-hkq-0]');
  const htmlChild = htmlRoot.firstElementChild;


  // Assert
  adapter.subscribe((evt: AdapterEvent) => {
    t.deepEqual(evt, {
      type: AdapterEventType.REMOVE,
      node: htmlChild
    }, 'emits element removed event');
  });


  // Act
  adapter.removeChild(htmlChild);


  // Cleanup
  document.body.removeChild(htmlRoot);

});
