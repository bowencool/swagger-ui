let count = 1;
const EXAMPLES = {
  integer: 1,
  int: 1,
  number: 1,
  boolean: true,
  object: {},
};
/**
 * @description 是一个可用于展示的模型
 * @returns {boolean}
 */
export const isModel = m => 'properties' in m;

/**
 * @description 获取示例，没有则返回undefined
 * @param {Object} model
 * @param {string[]} keys 要搜寻的字段
 */
export const getExample = (m, keys = ['example', 'default']) => {
  const k = keys.find(kk => Object.prototype.hasOwnProperty.call(m, kk));
  if (k) {
    let eg = m[k];
    if (k === 'type') {
      eg = EXAMPLES[m.type] || eg;
    }
    return m.type === 'array' && !Array.isArray(eg) ? [eg] : eg;
  }
  return undefined;
};

/**
 * @description 获取模型名称，不处理type
 * @returns {string}
 */
export const getName = m => {
  const { $ref, name, type } = m;
  // console.log(m);
  if (name) return name;
  if ($ref) {
    const rez = $ref.match(/\w+$/);
    return rez[0];
  }
  if (!isModel(m)) {
    // console.warn('getName failed: this is an invalid model', m);
    return type;
  }
  // console.warn('getName failed:', m);
  return `inlineModel${count++}`;
};

/**
 * @description 获取字段展示名称
 * @returns {string} innerHTML string
 */
export const displayName = m => {
  if (m.type === 'array') {
    const name = getName(m.items);
    return `<span class="g-c-${
      name === m.items.type ? 'type' : 'ctor'
    }">${name}</span>[]`;
  }
  if (m.type === 'object') {
    const eg = getExample(m);
    return eg
      ? '<span class="g-c-type">object</span>'
      : `<span class="g-c-ctor">${getName(m)}</span>`;
  }
  return m.type
    ? `<span class="g-c-type">${m.type}${m.format ? `($${m.format})` : ''}</span>`
    : `<span class="g-c-ctor">${getName(m)}</span>`;
};
