export enum Theme {
  Light,
  Dark,
}

export enum ComponentView {
  Hybrid,     // show all elements with Angular properties set
  All,        // show all components and elements
  Components, // show components only
}

export enum AnalyticsConsent {
  NotSet,
  Yes,
  No,
}

export interface SimpleOptions {
  theme: Theme;
  componentView: ComponentView;
  analyticsConsent: AnalyticsConsent;
  diagnosticToolsEnabled: boolean;
}

export const defaultOptions = (): SimpleOptions => {
  return {
    theme: Theme.Light,
    componentView: ComponentView.Hybrid,
    analyticsConsent: AnalyticsConsent.NotSet,
    diagnosticToolsEnabled: false,
  };
};

export const loadOptions = (): Promise<SimpleOptions> => {
  return loadFromStorage()
    .then(result => {
      const combined = Object.assign({}, defaultOptions(), result);

      // for backward compatibility previous installs that saved as a string:
      switch (<Theme | string>combined.theme) {
        case 'light':
          combined.theme = Theme.Light;
          break;
        case 'dark':
          combined.theme = Theme.Dark;
          break;
      }

      return combined;
    });
};

const loadFromStorage = (): Promise<SimpleOptions> => {
  return new Promise(resolve => {
    chrome.storage.sync.get(Object.keys(defaultOptions()), (result: SimpleOptions) => {
      resolve(result);
    });
  });
};

export const saveOptions = (options: SimpleOptions) => {
  for (const key of Object.keys(options)) {
    chrome.storage.sync.set({
      [key]: options[key]
    });
  }
};
