import { AmiSuperheroPage } from './app.po';

describe('ami-superhero App', function() {
  let page: AmiSuperheroPage;

  beforeEach(() => {
    page = new AmiSuperheroPage();
  })

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('ami-superhero Works!');
  });
});
