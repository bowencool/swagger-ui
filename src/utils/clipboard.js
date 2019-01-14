/**
 * @description 复制到粘贴板指令, 使用方法：v-clipboard="text"
 * @param {string} text 要复制的文本
 */
import Clipboard from 'clipboard';
import { message } from 'ant-design-vue';

function ProxyClipboard(el, options) {
  if (el.clipboard) {
    el.clipboard.destroy();
    // console.log('destroyed');
  }
  const clipboard = new Clipboard(el, options);
  clipboard.on('success', e => {
    message.success('复制成功');
  });
  clipboard.on('error', e => {
    message.error('复制失败');
  });
  return clipboard;
}

export default {
  bind(el, binding) {
    // console.log('bind', binding.value);
    el.clipboard = new ProxyClipboard(el, {
      text: () => binding.value,
    });
  },
  update(el, binding) {
    // console.log(
    //   'update',
    //   `${binding.oldValue} -> ${binding.value}`,
    // );
    el.clipboard = new ProxyClipboard(el, {
      text: () => binding.value,
    });
  },
};
