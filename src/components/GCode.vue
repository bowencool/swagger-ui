<style lang="less" scoped>
.g-code {
  position: relative;
  margin: 4px 0;
  &_actions {
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
  }
}
</style>

<template>
  <div class="g-code">
    <div class="g-code_actions">
      <span @click="onCopy">复制</span>
    </div>
    <div ref="copyDom" class="g-code_body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'g-code',
  methods: {
    onCopy() {
      const dom = this.$refs.copyDom;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(dom);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      // selection.removeAllRanges();
      this.$message.success('复制成功');
    },
  },
};
</script>
