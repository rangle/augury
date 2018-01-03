import * as test from 'tape';
import {Description} from './description';

test('utils/description: Passing component undefined', t => {
  t.plan(1);
  const description = Description.getComponentDescription(undefined);

  t.deepEqual(description, [], 'get undefined description');
  t.end();
});

test('utils/description: Passing undefined', t => {
  t.plan(1);

  const compEl = {
    nativeElement: {
      tagName: 'tagName'
    }
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [], 'get empty description');
  t.end();
});

test.skip('utils/description: RouterLink', t => {
  t.plan(1);

  class RouterLink { }

  const link = document.createElement('a');
  link.href = 'href';
  link.text = 'htmlText';

  const routerLink: RouterLink = new RouterLink();

  const compEl = {
    'nativeElement': link,
    componentInstance: routerLink
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'href',
      value: 'href'
    },
    {
      key: 'htmlText',
      value: 'htmlText'
    }
  ], 'get RouterLink description');
  t.end();
});


test.skip('utils/description: RouterOutlet', t => {
  t.plan(1);

  const compEl = {
    providerTokens: [function RouterOutlet() {
      console.log('RouterOutlet');
    }],
    injector: {
      get: (name: string) => {
        return {
          name: 'RouterOutlet',
          '_currentInstruction': {
            routeName: 'routeName',
            componentType: function componentType() {
              return 'componentType';
            }
          }
        };
      }
    }
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'name',
      value: 'RouterOutlet'
    },
    {
      key: 'routeName',
      value: 'routeName'
    },
    {
      key: 'hostComponent',
      value: 'componentType'
    }
  ], 'get RouterOutlet description');
  t.end();
});

test('utils/description: NgSelectOption', t => {
  t.plan(1);

  class NgSelectOption { }

  const div = document.createElement('div');
  div.setAttribute('value', 'value');

  const node = document.createTextNode('innerText');
  div.appendChild(node);

  const ngSelectOption: NgSelectOption = new NgSelectOption();

  const compEl = {
    nativeElement: div,
    componentInstance: ngSelectOption
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'label',
      value: 'innerText'
    },
    {
      key: 'value',
      value: 'value'
    }
  ], 'get NgSelectOption description');

});

test('utils/description: NgIf', t => {
  t.plan(1);

  class NgIf {
    '_prevCondition': boolean = true;
  }

  const ngIf: NgIf = new NgIf();
  const compEl = {
    componentInstance: ngIf
  };
  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'condition',
      value: true
    }], 'get NgIf description');
  t.end();
});


test('utils/description: NgSwitch', t => {
  t.plan(1);

  class NgSwitch {
    '_useDefault': boolean = true;
    '_switchValue': boolean = true;
    '_valueViews': any = {
      size: 10
    };
  }
  const ngSwitch: NgSwitch = new NgSwitch();

  const compEl = {
    componentInstance: ngSwitch
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'useDefault', value: true
    },
    {
      key: 'switchDefault', value: true
    },
    {
      key: 'valuesCount', value: 10
    }
  ], 'get NgSwitch description');
  t.end();
});


test.skip('utils/description: NgForm', t => {
  t.plan(1);

  class NgForm {
    form: any = {
      status: true,
      dirty: false
    };
  }
  const ngForm: NgForm = new NgForm();

  const compEl = {
    componentInstance: ngForm
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'status',
      value: true
    }, {
      key: 'dirty',
      value: false
    }], 'get NgForm description');
  t.end();
});

test('utils/description: NgControlName', t => {
  t.plan(1);

  class NgControlName {
    name: string = 'ControlName';
    value: string = 'ControlValue';
    valid: boolean = true;
  }
  const ngControlName: NgControlName = new NgControlName();

  const compEl = {
    componentInstance: ngControlName
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'name',
      value: 'ControlName'
    }, {
      key: 'value',
      value: 'ControlValue'
    }, {
      key: 'valid',
      value: true
    }], 'get NgControlName description');
  t.end();
});

test('utils/description: NgSwitchWhen', t => {
  t.plan(1);

  class NgSwitchWhen {
    '_value': string = 'switchValue';
  }
  const comp: NgSwitchWhen = new NgSwitchWhen();

  const compEl = {
    componentInstance: comp
  };

  const description = Description.getComponentDescription(compEl);
  t.deepEqual(description, [
    {
      key: 'value', value: 'switchValue'
    }
  ], 'get NgSwitchWhen description');
  t.end();
});

test.skip('utils/description: NgModel', t => {
  t.plan(1);

  class NgModel {
    name: string = 'modelName';
    value: string = 'modelValue';
    viewModel: string = 'viewModel';
    dirty: boolean = true;
    control: any = {
      status: true
    };
  }
  const comp: NgModel = new NgModel();

  const compEl = {
    componentInstance: comp
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'model',
      value: 'modelName'
    }, {
      key: 'value',
      value: 'modelValue'
    }, {
      key: 'viewModel',
      value: 'viewModel'
    }, {
      key: 'controlStatus',
      value: true
    }, {
      key: 'dirty',
      value: true
    }], 'get NgModel description');
  t.end();
});

test.skip('utils/description: NgFormControl', t => {
  t.plan(1);

  class NgFormControl {
    name: string = 'modelName';
    value: string = 'modelValue';
    viewModel: string = 'viewModel';
    dirty: boolean = true;
  }
  const comp: NgFormControl = new NgFormControl();

  const compEl = {
    componentInstance: comp
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'model',
      value: 'modelName'
    }, {
      key: 'value',
      value: 'modelValue'
    }, {
      key: 'viewModel',
      value: 'viewModel'
    }, {
      key: 'dirty',
      value: true
    }], 'get NgFormControl description');
  t.end();
});

test.skip('utils/description: NgFormModel', t => {
  t.plan(1);

  class NgFormModel {
    form: any = {
      status: true,
      dirty: true
    };
    value: any = {
      name: 'CompName'
    };
  }
  const comp: NgFormModel = new NgFormModel();

  const compEl = {
    componentInstance: comp
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'status',
      value: true
    }, {
      key: 'dirty',
      value: true
    }, {
      key: 'value',
      value: '{"name":"CompName"}'
    }], 'get NgFormModel description');
  t.end();
});

test.skip('utils/description: NgClass', t => {
  t.plan(1);

  const compEl = {
    providerTokens: [function NgClass() {
      console.log('NgClass');
    }],
    injector: {
      get: (name: string) => {
        return {
          '_rawClass': {
            'class1': 'class1',
            'class2': 'class2',
            'class3': 'class3'
          }
        };
      }
    }
  };

  const description = Description.getComponentDescription(compEl);

  t.deepEqual(description, [
    {
      key: 'applied',
      value: 'class1,class2,class3'
    }], 'get NgClass description');
  t.end();
});
