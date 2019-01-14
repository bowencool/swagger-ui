<template>
  <div class="json-editor">
    <textarea ref="textarea"></textarea>
  </div>
</template>

<script>
import CodeMirror from 'codemirror';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/lib/codemirror.css';
import './theme.less';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';

import 'script-loader!jsonlint'; //eslint-disable-line

export default {
  name: 'c-json-editor',
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      jsonEditor: false,
    };
  },
  watch: {
    value(value) {
      const editor_value = this.jsonEditor.getValue();
      if (value !== editor_value) {
        this.jsonEditor.setValue(this.value);
      }
    },
  },
  mounted() {
    this.jsonEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'vsc',
      lint: true,
    });
    this.jsonEditor.setValue(this.value);
    this.jsonEditor.on('change', cm => {
      this.$emit('changed', cm.getValue());
      this.$emit('input', cm.getValue());
    });
  },
};
</script>

<style scoped>
.json-editor {
  height: 100%;
  position: relative;
  font-size: 12px;
  border-radius: 4px;
  overflow: hidden;
}
.json-editor >>> .CodeMirror {
  height: auto;
  /* max-height: 600px; */
  /* overflow: scroll; */
  min-height: 300px;
}
.json-editor >>> .CodeMirror-scroll {
  /* height: 100%; */
  min-height: 300px;
}

.has-error .json-editor {
  border-color: red;
}
</style>
