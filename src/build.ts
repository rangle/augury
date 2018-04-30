
declare const BUILD: any;

interface Build {
  _name: string;
  GTM: boolean;
  SENTRY: boolean;
}

export default (): Build => BUILD;
