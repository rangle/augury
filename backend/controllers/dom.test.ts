import * as test from 'tape';
import { DomController } from '../controllers/dom';


test('controllers/doms', t => {
  t.plan(1);

  const rootText = document.createTextNode('I am root!');
  const childText = document.createTextNode('I am child!');
  const rootDiv = document.createElement('div');
  const childDiv =  document.createElement('span');

  rootDiv.setAttribute('_ngcontent-hkq-0', '');
  rootDiv.appendChild(rootText);
  childDiv.appendChild(childText);
  rootDiv.appendChild(childDiv);
  document.body.appendChild(rootDiv);

  const adapter = DomController.detectFramework();
  const controller = new DomController(adapter, {
    sendMessage: (msg: Object) => console.log(msg)
  });

  adapter.addRoot(rootDiv);
  adapter.addChild(childDiv);

  t.skip('build model successful');

});
