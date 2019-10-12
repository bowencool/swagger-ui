<style lang="less">
.c-schema {
  // box-sizing: content-box;
  border: 1px solid transparent;
  border-radius: 4px;
}
.has-error {
  .c-schema {
    border: 1px solid red;
  }
}
</style>

<template>
  <div class="c-schema">
    <c-tabs :default-value="editable ? 'value' : 'example'">
      <c-tab-pane
        :style="{maxHeight}"
        value="model"
        title="模型"
        class="g-code"
      >
        <c-model
          v-for="(m,name) in models"
          :key="name"
          :model="m"
        ></c-model>
      </c-tab-pane>
      <c-tab-pane
        value="example"
        title="示例"
      >
        <pre
          :style="{maxHeight}"
          class="g-code"
          v-html="jsonHtml"
        ></pre>
      </c-tab-pane>
      <c-tab-pane
        v-if="editable"
        :style="{maxHeight}"
        value="value"
        title="Body"
      >
        <slot name="input">input</slot>
      </c-tab-pane>
    </c-tabs>
  </div>
</template>

<script>
import { jsonHighlight } from '@/utils';
import CTabs from '../CTabs';
import CModel from './CModel';
import { getName, isModel, getExample } from './utils';

export default {
  components: {
    CModel,
    CTabs,
    CTabPane: CTabs.Pane,
  },
  inject: ['definitions'],
  props: {
    schema: {
      type: Object,
      required: true,
    },
    maxHeight: {
      type: String,
      // default: '600px',
    },
    editable: Boolean,
  },
  data() {
    return {
      models: {},
      example: {},
    };
  },
  computed: {
    jsonHtml() {
      return jsonHighlight(this.example);
    },
  },
  created() {
    this.putModel(this.getModel(this.schema));
    const initialValue = JSON.stringify(this.example, null, 2);
    // this.$emit('input', initialValue);
    this.$emit('input', initialValue);
  },
  methods: {
    setExample(value, paths) {
      let target = this.example;
      if (
        paths.length === 1
        && paths[0].isArray
        && !Array.isArray(this.example)
      ) {
        this.example = [{}];
      }

      if (paths[0].isArray) {
        target = this.example[0]; // eslint-disable-line
      }

      paths.forEach(({ key }, i, src) => {
        if (i === src.length - 1) {
          // 最后一个key
          target[key] = value;
        } else {
          const isNextArray = paths[i + 1].isArray;
          if (target[key] === undefined) {
            target[key] = isNextArray ? [{}] : {};
          }
          target = isNextArray ? target[key][0] : target[key];
        }
      });
    },
    getDef(modelOrSchema) {
      const name = getName(modelOrSchema);
      const def = this.definitions[name];
      return {
        ...def,
        name,
      };
    },
    getModel(schema) {
      let model = schema;
      if ('$ref' in model) {
        model = this.getDef(model);
      }
      if ('allOf' in model) {
        const properties = model.allOf.reduce(
          (pre, cur) => Object.assign(pre, this.getModel(cur).properties),
          {},
        );
        model.properties = properties;
      }
      if (model.type === 'array') {
        model = {
          ...this.getModel(model.items),
          type: 'array',
        };
      }
      model.name = getName(model);
      // console.log(model);
      if (schema.additionalProperties) {
        if (!model.properties) model.properties = {};
        model.properties.additionalProperties = schema.additionalProperties;
        // console.log(schema, model);
      }
      // 这里的返回值一定有UI展示所需的所有properties
      return model;
    },
    putModel(model, paths = []) {
      if (this.models[model.name]) {
        // 防止循环引用
        this.setExample({}, paths);
        return;
      }
      if (isModel(model)) {
        this.models[model.name] = model;
      }
      const eg = getExample(model);
      if (eg !== undefined) {
        this.setExample(eg, paths);
        return;
      }
      if ('properties' in model) {
        Object.entries(model.properties).forEach(([key, childSchema]) => {
          const newPaths = [
            ...paths,
            {
              key,
              isArray: model.type === 'array', // 当前key是否嵌套在array[0]中
            },
          ];
          if (
            '$ref' in childSchema
            || 'allOf' in childSchema
            || childSchema.type === 'object'
            || childSchema.type === 'array'
          ) {
            const grandsonSchema = this.getModel(childSchema);
            this.putModel(grandsonSchema, newPaths);
          } else {
            try {
              const eg2 = getExample(childSchema, ['example', 'default', 'type']);
              this.setExample(eg2 !== undefined ? eg2 : {}, newPaths);
            } catch (e) {
              console.warn(e.message, model.name, newPaths);
            }
          }
        });
      }
    },
  },
};
</script>
