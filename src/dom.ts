type Span = {
  className: string;
  content: string;
  tabIndex?: number;
  dataAttributes?: Record<string, string | number>;
};

const span = (config: Span) => {
  const span = document.createElement("span");
  span.className = config.className;
  if (config.tabIndex !== null && config.tabIndex !== undefined) {
    span.tabIndex = config.tabIndex;
  }
  const content = document.createTextNode(config.content);

  Object.entries(config.dataAttributes ?? {}).forEach(([key, value]) => {
    span.setAttribute(`data-${key}`, value.toString());
  });

  span.appendChild(content);

  return span;
};

type ElementConfig = {
  className: string;
  children: HTMLElement[];
};

const createElement = (name: string) => (config: ElementConfig) => {
  const element = document.createElement(name);
  element.className = config.className;
  element.append(...config.children);

  return element;
};

const p = createElement("p");

const section = createElement("section");

export default { span, p, section };
