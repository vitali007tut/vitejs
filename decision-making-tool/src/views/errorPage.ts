import type { Router } from '../router';
import { createEl } from '../utils';

export function renderErrorPage(router: Router): void {
  const errorMsg = createEl({
    tagName: 'div',
    className: 'ErrorText',
    textContent: 'Error: Page not found.',
  });
  document.body.appendChild(errorMsg);

  const backButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Back to Main Page',
  });
  backButton.onclick = (): void =>
    router.navigate('/vitali007tut-JSFE2024Q4/decision-making-tool/');
  document.body.appendChild(backButton);
}
