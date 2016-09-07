export enum Theme {
  Light,
  Dark,
}

export interface SimpleOptions {
  showElements?: boolean;
  theme?: Theme;
}

export const loadOptions = (): Promise<SimpleOptions> => {
  return new Promise(resolve => {
    chrome.storage.sync.get(['theme', 'showElements'],
      (result: {theme: string | Theme, showElements: boolean}) => {
        const theme = (result || {theme: Theme.Light}).theme;
        switch (theme) {
          case 'light': // for previous installs that saved as a string
          case Theme.Light:
          default:
            result.theme = Theme.Light;
            break;
          case 'dark':
          case Theme.Dark:
            result.theme = Theme.Dark;
            break;
        }

        const showElements = (result || {showElements: true}).showElements;
        if (showElements != null) {
          result.showElements = showElements;
        }

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
