export default class AnalyticsService {
  private GA;

  constructor() {
    if (window.hasOwnProperty('ga')) {

      // todo: figure out what rule to specifically ignore on next line here
      // instead using type assertion here to get around issue
      // https://basarat.gitbooks.io/typescript/content/docs/types/type-assertion.html
      this.GA = (window as any).ga;
    }
  }

  public sendEvent(category: String, action: String, label?: String, value?: Number) {
    try {
      this.GA('send', 'event', ...Array.from(arguments));
    } catch (e) {
      console.log(e);
    }
  }
}
