export class AmiSuperheroPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('ami-superhero-app p')).getText();
  }
}
