import { JtViewerPage } from './app.po';

describe('jt-viewer App', () => {
  let page: JtViewerPage;

  beforeEach(() => {
    page = new JtViewerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
