<style lang="less">
.collapse-transition {
  transition:
 0.3s height ease-in-out,
 0.3s padding-top ease-in-out,
    0.3s padding-bottom ease-in-out;
}
</style>

<script>
const Transition = {
  beforeEnter(el) {
    if (!el.dataset) el.dataset = {};
    const styles = window.getComputedStyle(el);

    el.dataset.oldOverflow = styles.getPropertyValue('overflow');
    el.dataset.oldPaddingTop = styles.getPropertyValue('padding-top');
    el.dataset.oldPaddingBottom = styles.getPropertyValue('padding-bottom');

    el.style.height = 0;
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
    el.classList.add('collapse-transition');
    el.style.overflow = 'hidden';
  },

  enter(el) {
    if (el.scrollHeight !== 0) {
      el.style.height = `${el.scrollHeight}px`;
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    }
  },

  afterEnter(el) {
    el.classList.remove('collapse-transition');
    el.style.height = '';
    el.style.overflow = el.dataset.oldOverflow;
  },

  beforeLeave(el) {
    if (!el.dataset) el.dataset = {};
    const styles = window.getComputedStyle(el);
    el.dataset.oldOverflow = styles.getPropertyValue('overflow');
    el.dataset.oldPaddingTop = styles.getPropertyValue('padding-top');
    el.dataset.oldPaddingBottom = styles.getPropertyValue('padding-bottom');

    el.style.height = `${el.scrollHeight
      - parseFloat(el.dataset.oldPaddingTop)
      - parseFloat(el.dataset.oldPaddingBottom)}px`;
    el.style.overflow = 'hidden';
    el.classList.add('collapse-transition');

    const tmp = el.offsetLeft;
  },

  leave(el) {
    el.style.height = 0;
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
  },

  afterLeave(el) {
    el.classList.remove('collapse-transition');
    el.style.height = '';
    el.style.overflow = el.dataset.oldOverflow;
    el.style.paddingTop = el.dataset.oldPaddingTop;
    el.style.paddingBottom = el.dataset.oldPaddingBottom;
  },
};

export default {
  name: 'el-collapse-transition',
  functional: true,
  render(h, context) {
    const data = {
      on: Transition,
    };
    return h('transition', data, context.children);
  },
};
</script>
