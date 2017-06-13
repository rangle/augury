import { Description } from './description';

test('utils/description: Passing component undefined', () => {
  const description = Description.getComponentDescription(undefined);

  expect(description.length).toBe(0);
});

test('utils/description: Passing undefined', () => {
  const compEl = {
    nativeElement: {
      tagName: 'tagName',
    },
  };

  const description = Description.getComponentDescription(compEl);

  expect(description.length).toBe(0);
});

test.skip('utils/description: RouterLink', () => {
  class RouterLink {}

  const link = document.createElement('a');
  link.href = 'href';
  link.text = 'htmlText';

  const routerLink: RouterLink = new RouterLink();

  const compEl = {
    nativeElement: link,
    componentInstance: routerLink,
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toBe([
    {
      key: 'href',
      value: 'href',
    },
    {
      key: 'htmlText',
      value: 'htmlText',
    },
  ]);
});

test.skip('utils/description: RouterOutlet', () => {
  const compEl = {
    providerTokens: [
      function RouterOutlet() {
        console.log('RouterOutlet');
      },
    ],
    injector: {
      get: (name: string) => {
        return {
          name: 'RouterOutlet',
          _currentInstruction: {
            routeName: 'routeName',
            componentType: function componentType() {
              return 'componentType';
            },
          },
        };
      },
    },
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toBe([
    {
      key: 'name',
      value: 'RouterOutlet',
    },
    {
      key: 'routeName',
      value: 'routeName',
    },
    {
      key: 'hostComponent',
      value: 'componentType',
    },
  ]);
});

test('utils/description: NgSelectOption', () => {
  class NgSelectOption {}

  const div = document.createElement('div');
  div.setAttribute('value', 'value');

  const node = document.createTextNode('innerText');
  div.appendChild(node);

  const ngSelectOption: NgSelectOption = new NgSelectOption();

  const compEl = {
    nativeElement: div,
    componentInstance: ngSelectOption,
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toEqual([
    {
      key: 'value',
      value: 'value',
    },
  ]);
});

test('utils/description: NgIf', () => {
  class NgIf {
    _prevCondition: boolean = true;
  }

  const ngIf: NgIf = new NgIf();
  const compEl = {
    componentInstance: ngIf,
  };
  const description = Description.getComponentDescription(compEl);

  expect(description).toEqual([
    {
      key: 'condition',
      value: true,
    },
  ]);
});

test('utils/description: NgSwitch', () => {
  class NgSwitch {
    _useDefault: boolean = true;
    _switchValue: boolean = true;
    _valueViews: any = {
      size: 10,
    };
  }
  const ngSwitch: NgSwitch = new NgSwitch();

  const compEl = {
    componentInstance: ngSwitch,
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toEqual([
    {
      key: 'useDefault',
      value: true,
    },
    {
      key: 'switchDefault',
      value: true,
    },
    {
      key: 'valuesCount',
      value: 10,
    },
  ]);
});

test.skip('utils/description: NgForm', () => {
  class NgForm {
    form: any = {
      status: true,
      dirty: false,
    };
  }
  const ngForm: NgForm = new NgForm();

  const compEl = {
    componentInstance: ngForm,
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toEqual([
    {
      key: 'status',
      value: true,
    },
    {
      key: 'dirty',
      value: false,
    },
  ]);
});

test('utils/description: NgControlName', () => {
  class NgControlName {
    name: string = 'ControlName';
    value: string = 'ControlValue';
    valid: boolean = true;
  }
  const ngControlName: NgControlName = new NgControlName();

  const compEl = {
    componentInstance: ngControlName,
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toEqual([
    {
      key: 'name',
      value: 'ControlName',
    },
    {
      key: 'value',
      value: 'ControlValue',
    },
    {
      key: 'valid',
      value: true,
    },
  ]);
});

test('utils/description: NgSwitchWhen', () => {
  class NgSwitchWhen {
    _value: string = 'switchValue';
  }
  const comp: NgSwitchWhen = new NgSwitchWhen();

  const compEl = {
    componentInstance: comp,
  };

  const description = Description.getComponentDescription(compEl);
  expect(description).toEqual([
    {
      key: 'value',
      value: 'switchValue',
    },
  ]);
});

test.skip('utils/description: NgModel', () => {
  class NgModel {
    name: string = 'modelName';
    value: string = 'modelValue';
    viewModel: string = 'viewModel';
    dirty: boolean = true;
    control: any = {
      status: true,
    };
  }
  const comp: NgModel = new NgModel();

  const compEl = {
    componentInstance: comp,
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toEqual([
    {
      key: 'model',
      value: 'modelName',
    },
    {
      key: 'value',
      value: 'modelValue',
    },
    {
      key: 'viewModel',
      value: 'viewModel',
    },
    {
      key: 'controlStatus',
      value: true,
    },
    {
      key: 'dirty',
      value: true,
    },
  ]);
});

test.skip('utils/description: NgFormControl', () => {
  class NgFormControl {
    name: string = 'modelName';
    value: string = 'modelValue';
    viewModel: string = 'viewModel';
    dirty: boolean = true;
  }
  const comp: NgFormControl = new NgFormControl();

  const compEl = {
    componentInstance: comp,
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toBe([
    {
      key: 'model',
      value: 'modelName',
    },
    {
      key: 'value',
      value: 'modelValue',
    },
    {
      key: 'viewModel',
      value: 'viewModel',
    },
    {
      key: 'dirty',
      value: true,
    },
  ]);
});

test.skip('utils/description: NgFormModel', () => {
  class NgFormModel {
    form: any = {
      status: true,
      dirty: true,
    };
    value: any = {
      name: 'CompName',
    };
  }
  const comp: NgFormModel = new NgFormModel();

  const compEl = {
    componentInstance: comp,
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toBe([
    {
      key: 'status',
      value: true,
    },
    {
      key: 'dirty',
      value: true,
    },
    {
      key: 'value',
      value: '{"name":"CompName"}',
    },
  ]);
});

test.skip('utils/description: NgClass', () => {
  const compEl = {
    providerTokens: [
      function NgClass() {
        console.log('NgClass');
      },
    ],
    injector: {
      get: (name: string) => {
        return {
          _rawClass: {
            class1: 'class1',
            class2: 'class2',
            class3: 'class3',
          },
        };
      },
    },
  };

  const description = Description.getComponentDescription(compEl);

  expect(description).toBe([
    {
      key: 'applied',
      value: 'class1,class2,class3',
    },
  ]);
});
