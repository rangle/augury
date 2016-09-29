import {
  Component,
  Inject,
} from '@angular/core';

import {
  Service1,
  Service2,
  Service3,
  Service4,
} from '../../services';

@Component({
  selector: 'injector-tree',
  template: `
  <h3>Injector Tree</h3>
  <div class="panel-body">
    <p>injector-tree init: service1</p>
    {{service1Value}}
    <hr/>
    <injector-tree-dummy-1></injector-tree-dummy-1>
    <injector-tree-dummy-2></injector-tree-dummy-2>
  </div>
  `
})
export class InjectorTree {
  service1Value: string;

  constructor(
    private s1: Service1
  ) {
    this.service1Value = s1.value;
  }
}

@Component({
  selector: 'injector-tree-dummy-1',
  template: `
    <p>injector-tree-dummy-1 init: service3</p>
    {{service3Value}}
    <hr/>
    <injector-tree-dummy-3></injector-tree-dummy-3>
    <injector-tree-dummy-4></injector-tree-dummy-4>
  `
})
export class InjectorTreeDummy1 {
  service3Value: string;

  constructor(
    private s3: Service3
  ) {
    this.service3Value = s3.value;
  }
}


@Component({
  selector: 'injector-tree-dummy-2',
  template: `
    <p>injector-tree-dummy-2 init service2</p>
    {{service2Value}}
    <hr/>
    <injector-tree-dummy-5></injector-tree-dummy-5>
    <injector-tree-dummy-6></injector-tree-dummy-6>
  `
})
export class InjectorTreeDummy2 {
  service2Value: string;

  constructor(
    private s2: Service2
  ) {
    this.service2Value = s2.value;
  }
}

@Component({
  selector: 'injector-tree-dummy-3',
  template: `
    <p>injector-tree-dummy-3</p>
    {{service1Value}}
    {{service3Value}}
    <hr/>
  `
})
export class InjectorTreeDummy3 {
  service1Value: string;
  service3Value: string;

  constructor(
    private s1: Service1,
    private s3: Service3
  ) {
    this.service1Value = s1.value;
    this.service3Value = s3.value;
  }
}

@Component({
  selector: 'injector-tree-dummy-4',
  template: `
    <p>injector-tree-dummy-4 init: service4</p>
    {{service1Value}}
    {{service4Value}}
    <hr/>
  `
})
export class InjectorTreeDummy4 {
  service1Value: string;
  service4Value: string;

  constructor(
    private s1: Service1,
    private s4: Service4
  ) {
    this.service1Value = s1.value;
    this.service4Value = s4.value;
  }
}

@Component({
  selector: 'injector-tree-dummy-5',
  template: `
    <p>injector-tree-dummy-5 init: service3, service4</p>
    {{service3Value}}
    {{service4Value}}
  `
})
export class InjectorTreeDummy5 {
  service3Value: string;
  service4Value: string;

  constructor(
    private s3: Service3,
    private s4: Service4
  ) {
    this.service3Value = s3.value;
    this.service4Value = s4.value;
  }
}

@Component({
  selector: 'injector-tree-dummy-6',
  template: `
    <p>injector-tree-dummy-6</p>
    {{service1Value}}
    {{service2Value}}
    <hr/>
  `
})
export class InjectorTreeDummy6 {
  service1Value: string;
  service2Value: string;

  constructor(
    private s1: Service1,
    private s2: Service2
  ) {
    this.service1Value = s1.value;
    this.service2Value = s2.value;
  }
}
