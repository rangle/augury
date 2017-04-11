class AnalyticsService {
  private GA;

  constructor() {
    if (window.hasOwnProperty('ga')) {
      this.GA = window.ga;
    }
  }

  private sendEvent(category: String, action: String, label: String, value: Number) {
    try {
      this.GA('send', 'event', category, action, label, value);
    } catch (e) {
      console.log(e);
    }
  }
}

export default new AnalyticsService();
