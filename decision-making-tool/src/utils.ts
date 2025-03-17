export interface ElementOptions {
  tagName: string;
  className?: string;
  textContent?: string;
  attributes?: { [key: string]: string };
  children?: HTMLElement[];
}

export function createEl(options: ElementOptions): HTMLElement {
  const el = document.createElement(options.tagName);
  if (options.className) {
    el.className = options.className;
  }
  if (options.textContent) {
    el.textContent = options.textContent;
  }
  if (options.attributes) {
    for (const key in options.attributes) {
      el.setAttribute(key, options.attributes[key]);
    }
  }
  if (options.children) {
    options.children.forEach((child) => el.appendChild(child));
  }
  return el;
}
