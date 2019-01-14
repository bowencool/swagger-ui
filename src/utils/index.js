const map = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
};

export const escapeHtml = html => html.replace(/[<>&]/g, c => map[c]);

// https://github.com/luyilin/json-format-highlight/blob/master/src/index.js

export const jsonHighlight = (json, colorOptions = {}) => {
  if (!json) return '';
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  json = escapeHtml(json);
  // const colors = Object.assign({}, defaultColors, colorOptions);
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4,5}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    match => {
      if (/^(".+):$/.test(match)) {
        return `<span class="json-key">${RegExp.$1}</span>:`;
      }
      let type = 'number';
      if (/^".+"$/.test(match)) {
        type = 'string';
      }
      if (/true|false/.test(match)) {
        type = 'boolean';
      }
      if (/null/.test(match)) {
        type = 'null';
      }
      return `<span class="json-${type}">${match}</span>`;
    },
  );
};

export const debounce = (fn, ms = 300) => {
  let timer;
  return function debounced(...args) {
    clearInterval(timer);
    timer = setTimeout(() => {
      fn.call(this, ...args);
    }, ms);
  };
};
