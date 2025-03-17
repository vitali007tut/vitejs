import { renderDecisionPicker } from './views/decisionPicker';
import { renderErrorPage } from './views/errorPage';
import { renderListOptions } from './views/listOptions';

export class Router {
  public routes: { [key: string]: (router: Router) => void };

  constructor() {
    this.routes = {
      '/vitali007tut-JSFE2024Q4/decision-making-tool/': renderListOptions,
      '/vitali007tut-JSFE2024Q4/decision-making-tool/list': renderListOptions,
      '/vitali007tut-JSFE2024Q4/decision-making-tool/decision-picker':
        renderDecisionPicker,
    };
  }

  public init(): void {
    window.onpopstate = (): void => {
      this.render(window.location.pathname);
    };
    this.render(window.location.pathname);
  }

  public navigate(path: string): void {
    window.history.pushState({}, '', path);
    this.render(path);
  }

  public render(path: string): void {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    const view = this.routes[path] || renderErrorPage;
    view(this);
  }
}
