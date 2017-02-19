import { AmiSuperherosPage } from './app.po';

describe('ami-superheros App', function() {
  let page: AmiSuperherosPage;

  beforeEach(() => {
    page = new AmiSuperherosPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
