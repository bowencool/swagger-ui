<style lang="less">
.c-file-input {
  box-sizing: border-box;
  width: 100%;
  padding: 5px;
  border-radius: 4px;
  line-height: 1.3;
  color: #ccc;
  border: 1px solid #fff;
}
.has-error {
  .c-file-input {
    border-color: red;
  }
}
</style>


<template>
  <!-- todo: clearable multiple -->
  <input
    type="file"
    class="c-file-input"
    @change="handleChange"
  >
</template>

<script>
export default {
  methods: {
    handleChange(e) {
      const file = e.target.files[0];
      this.$emit('change', file);
      this.$emit('input', file);
    },
  },
};
</script>
