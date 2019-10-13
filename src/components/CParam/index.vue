<template>
  <tr>
    <!-- 参数 -->
    <td class="g-break-all">
      <span
        v-if="param.required"
        style="color: lightcoral;"
      >*</span>
      {{ param.name }}
      <p
        v-if="isBody"
        class="g-break-all"
      ><i>{{ param.description }}</i></p>
    </td>
    <!-- 值/FormItem -->
    <td :colspan="isBody ? '4': '1'">
      <a-form-item
        :validate-status="validate.status"
        :help="validate.message"
      >
        <c-file-input
          v-if="param.type === 'file'"
          v-model="param.value"
        ></c-file-input>
        <c-schema
          v-else-if="param.schema"
          :schema="param.schema"
          v-model="param.value"
          style="line-height: 1.5;"
          editable
        >
          <c-json-editor
            slot="input"
            v-model="param.value"
          ></c-json-editor>
        </c-schema>
        <a-select
          v-else-if="param.enum"
          v-model="param.value"
          :placeholder="param.required? 'required':''"
          allow-clear
          style="width: 100%;"
        >
          <a-select-option
            v-for="(v,i) in param.enum"
            :key="i"
            :value="v"
          >{{ v }}</a-select-option>
        </a-select>
        <a-switch
          v-else-if="param.type === 'boolean'"
          v-model="param.value"
          :default-checked="!!param.default"
        ></a-switch>
        <a-input
          v-else
          v-model="param.value"
          :placeholder="param.required? 'required':''"
        ></a-input>
      </a-form-item>
    </td>
    <template v-if="!isBody">
      <!-- 描述 -->
      <td class="g-break-all">{{ param.description }}</td>
      <!-- 位置 -->
      <td>{{ param.in }}</td>
      <!-- 简单类型 -->
      <td><i class="json-key">{{ param.type }}{{ param.format && `($${param.format})` }}</i></td>
    </template>
  </tr>
</template>

<script>
import CSchema from '../CSchema';
import CFileInput from '../CFileInput';
import CJsonEditor from '../CJsonEditor';

const blackList = ['', undefined, null];

export default {
  components: {
    CSchema,
    CFileInput,
    CJsonEditor,
  },
  inject: ['parameters'],
  props: {
    parameter: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      param: {},
      validate: {
        status: '',
        // message: '',
      },
    };
  },
  computed: {
    isBody() {
      return this.param.in === 'body';
    },
  },
  watch: {
    'param.value': 'validateFn',
  },
  created() {
    if ('$ref' in this.parameter) {
      const key = /\w+$/.exec(this.parameter.$ref)[0];
      this.param = {
        ...this.parameters[key],
        value: this.parameters[key].default,
      };
    } else {
      this.param = {
        ...this.parameter,
        value: this.parameter.default,
      };
    }
  },
  methods: {
    async validateFn() {
      if (this.param.required && blackList.includes(this.param.value)) {
        this.validate.status = 'error';
        // this.validate.message = '必填哦';
        throw new Error('检查输入');
      }
      if (this.isBody && this.param.required) {
        try {
          JSON.parse(this.param.value);
        } catch (e) {
          this.validate.status = 'error';
          throw new Error('检查输入');
        }
      }
      this.validate.status = 'success';
      this.validate.message = '';
    },
    // log(v) {
    //   console.log(v);
    //   this.param.value = v;
    // },
  },
};
</script>
