<style lang="less">
@import url(../../styles/vars.less);
.c-api {
  &__wrapper {
    color: #fff;
    text-shadow: 1px 1px 1px #222;
    border: 1px solid;
    & + & {
      margin-top: 10px;
    }
  }
  &__header {
    box-sizing: content-box;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
    &__path {
      margin-left: 5px;
      &.deprecated {
        text-decoration: line-through;
      }
    }
    &__summary {
      margin-right: 5px;
    }
    &__method {
      display: inline-block;
      height: 100%;
      color: #fff;
      width: 60px;
      text-align: center;
    }
    &__icon {
      line-height: inherit;
      margin: 0 -3px 0 3px;
    }
  }
  &__body {
    padding: 5px;
    border-top: 1px solid;
    h3 {
      margin: 4px 0 0;
    }
    p {
      margin: 0;
    }
    .footer {
      margin: 0 -5px -5px;
      line-height: 24px;
      border-top: 1px solid;
      text-align: center;
      cursor: pointer;
      .anticon {
        transform: rotateZ(90deg);
      }
    }
  }
}
.markdown {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #fff;
  }
}
.result-button {
  margin: 5px 5px 5px 0;
}
</style>

<template>
  <li
    :class="'c-api__wrapper--' + api.method"
    class="c-api__wrapper border-color"
  >
    <div
      class="c-api__header"
      @click="handleToggle"
    >
      <span class="c-api__header__method g-uppercase bg-color">{{ api.method }}</span>
      <a-icon
        v-if="isAuth"
        class="c-api__header__icon"
        type="lock"
      ></a-icon>
      <span
        v-clipboard="api.path"
        :class="{ deprecated: api.deprecated }"
        class="c-api__header__path"
        @click.stop
      >{{ api.path }}</span>
      <span class="c-api__header__summary g-fr">{{ api.summary }}</span>
    </div>

    <el-collapse-transition>
      <div
        v-if="isOpen"
        class="c-api__body border-color"
      >
        <h3 v-if="api.deprecated">警告：已过时</h3>

        <template v-if="api.description">
          <h3>备注</h3>
          <vue-markdown class="markdown">{{ api.description | fixDescription }}</vue-markdown>
        </template>

        <h3>响应</h3>
        <table class="g-table g-table--fixed">
          <colgroup>
            <col width="200">
          </colgroup>
          <thead>
            <tr>
              <th>状态码</th>
              <th>详细</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(res,code) in api.responses"
              :key="code+'table'"
            >
              <td>
                <p>{{ code }}</p><i
                  v-if="res.schema"
                  class="g-break-all"
                >{{ res.description }}</i>
              </td>
              <td>
                <c-schema
                  v-if="res.schema"
                  :schema="res.schema"
                  max-height="400px"
                ></c-schema>
                <vue-markdown
                  v-else
                  class="markdown"
                >{{ res.description }}</vue-markdown>
              </td>
            </tr>
          </tbody>
        </table>

        <template v-if="api.parameters">
          <h3>请求参数</h3>
          <!-- <a-form @submit.prevent="handleSubmit"> -->
          <table class="g-table g-table--fixed">
            <colgroup>
              <col width="200">
              <col width="300">
              <col>
              <col width="80">
              <col>
            </colgroup>
            <thead>
              <tr>
                <th>参数</th>
                <th>值</th>
                <th>描述</th>
                <th>位置</th>
                <th>类型</th>
              </tr>
            </thead>
            <tbody>
              <c-param
                v-for="(parameter, i) in api.parameters"
                :parameter="parameter"
                :ref="'param' + i"
                :key="i"
              ></c-param>
            </tbody>
          </table>
          <!-- </a-form> -->
        </template>

        <a-button
          :loading="loading"
          ghost
          class="result-button"
          @click="handleSubmit"
        >试一下</a-button>

        <a
          v-if="showResult"
          @click="showResult = false"
        >隐藏结果</a>

        <el-collapse-transition>
          <div v-if="showResult">
            <pre
              v-clipboard="url"
              v-if="url"
              class="g-code"
              style="cursor: pointer;"
            >{{ url }}</pre>

            <pre
              v-if="res.status"
              class="g-code"
              style="margin-top: 10px;"
            >status: {{ res.status }}</pre>

            <c-tabs
              v-if="!res.err"
              default-value="body"
            >
              <c-tab-pane
                value="curl"
                title="CURL"
              >
                <pre
                  v-clipboard="curl"
                  v-if="curl"
                  class="g-code"
                  style="cursor: pointer;"
                >{{ curl }}</pre>
              </c-tab-pane>

              <c-tab-pane
                value="headers"
                title="Headers"
              >
                <pre
                  v-if="res.headers"
                  class="g-code"
                  v-html="res.headers"
                ></pre>
              </c-tab-pane>

              <c-tab-pane
                value="body"
                title="Body"
              >
                <template v-if="res.body">
                  <pre
                    v-if="res.bodyType === 'json'"
                    ref="copyDom"
                    class="g-code"
                    v-html="res.body"
                  ></pre>
                  <pre
                    v-if="res.bodyType === 'text'"
                    class="g-code"
                    v-text="res.body"
                  ></pre>
                </template>
              </c-tab-pane>

            </c-tabs>

            <pre
              v-else
              class="g-code"
            >{{ res.err }}</pre>
          </div>
        </el-collapse-transition>

        <div
          class="footer border-color color"
          @click="handleCollapse"
        >
          <a-icon type="double-left"></a-icon>
        </div>

      </div>
    </el-collapse-transition>
  </li>
</template>

<script>
import { jsonHighlight } from '@/utils';
import VueMarkdown from 'vue-markdown';
import CTabs from '../CTabs';
import CSchema from '../CSchema';
import CParam from '../CParam';
import ElCollapseTransition from '../ElCollapseTransition';

export default {
  components: {
    CSchema,
    CParam,
    CTabs,
    CTabPane: CTabs.Pane,
    ElCollapseTransition,
    VueMarkdown,
  },
  filters: {
    fixDescription(str) {
      return str.replace(/ +/g, ' ');
    },
  },
  inject: ['basePath', 'settings'],
  props: {
    api: {
      type: Object,
      required: true,
    },
  },
  data() {
    const query = new URLSearchParams(window.location.search);
    const isOpen = query.get('path') === this.api.path
      && query.get('method') === this.api.method;

    return {
      isOpen,
      loading: false,
      showResult: false,
      res: {
        headers: '', // html string
        bodyType: 'json',
        body: '',
        err: '',
        status: '',
      },
      url: '',
      curl: '',
    };
  },
  computed: {
    isAuth() {
      return (
        Array.isArray(this.api.security)
        && this.api.security.some(wtf => 'api_key' in wtf)
      );
    },
  },
  methods: {
    handleToggle() {
      this.isOpen = !this.isOpen;
      const url = new URL(window.location.href);
      if (this.isOpen) {
        url.searchParams.set('path', this.api.path);
        url.searchParams.set('method', this.api.method);
      } else {
        url.searchParams.delete('path');
        url.searchParams.delete('method');
      }
      window.history.replaceState(null, '', url.href);
    },
    handleCollapse() {
      this.isOpen = false;
      // 70px是顶部Header的高度
      if (window.chrome && (this.$el.offsetTop - window.pageYOffset - 70 < 0)) {
        window.scrollTo(window.scrollX, this.$el.offsetTop - 70);
      }
    },
    async handleSubmit() {
      /* eslint-disable prefer-const */
      let {
        path,
        method,
        // produces: [mime = 'application/json'] = ['application/json'],
      } = this.api;

      let curl = `curl \\\n  -X ${method.toUpperCase()} \\\n  -H 'Accept: application/json'`;

      const requestOptions = {
        method,
        headers: {
          Accept: 'application/json',
          // 'Content-type': mime,
        },
        credentials: 'include',
      };

      if (this.isAuth && this.settings.accessToken) {
        curl += ` \\\n  -H 'Authorization: Bearer ${this.settings.accessToken}'`;
        requestOptions.headers.Authorization = `Bearer ${
          this.settings.accessToken
        }`;
      }

      const queries = new URLSearchParams();
      let jsonData;
      const formData = new FormData();

      if (Array.isArray(this.api.parameters)) {
        for (let i = 0; i < this.api.parameters.length; i++) {
          const paramComp = this.$refs[`param${i}`][0];
          await paramComp.validateFn();
          const { param } = paramComp;
          switch (param.in) {
            case 'path':
              path = path.replace(new RegExp(`{${param.name}}`), param.value);
              break;
            case 'query':
              if (param.value !== undefined) {
                queries.append(param.name, param.value);
              }
              break;
            case 'formData':
              if (param.value !== undefined) {
                formData.append(param.name, param.value);
                curl += ` \\\n  -F ${param.name}=${
                  param.value instanceof File ? '@file' : param.value
                }`;
              }
              break;
            case 'body':
              if (param.value !== undefined) {
                jsonData = param.value;
                curl += ` \\\n  -d '${param.value.replace(/\n\s*/g, '')}'`;
              }
              break;
            default:
          }
        }
      }

      const queriesStr = queries.toString();

      const { origin, usingCurrent } = this.settings;
      const url = (usingCurrent ? window.location.origin : origin)
        + this.basePath
        + path
        + (queriesStr ? `?${queriesStr}` : queriesStr);

      if (method !== 'get') {
        requestOptions.body = jsonData || formData;
        if (jsonData) {
          requestOptions.headers['Content-Type'] = 'application/json';
        }
        // mime = jsonData
        //   ? 'application/json'
        //   : 'multipart/form-data';
        // requestOptions.headers['Content-type'] = mime;
        // curl = curl.replace(/Content-type:\s*([^']+)/, `Content-type: ${mime}`);
        // curl = curl.replace(/(?<=Content-type:\s*)[^']+/, mime); // babel暂不支持
      }

      this.url = url;
      this.curl = `${curl}\\\n  '${url}'`;

      this.loading = true;

      try {
        const response = await fetch(url, requestOptions);
        const contentType = response.headers.get('content-type');
        if (/json/.test(contentType)) {
          // jsonHighlight方法已内置escapeHTML
          const res = await response.json();
          this.res.bodyType = 'json';
          this.res.body = jsonHighlight(res);
        } else if (/text|html|xml/.test(contentType)) {
          const res = await response.text();
          this.res.bodyType = 'text';
          this.res.body = res;
        // } else if (/image/.test(contentType)) {
        //   this.res.bodyType = 'image';
        } else {
          const rez = response.headers.get('content-disposition').match(/filename\*?=(utf-8'')?("?)([^"]*)\2$/);
          const filename = decodeURIComponent(rez && rez[3]);
          const blob = await response.blob();

          const a = document.createElement('a');
          const blobUrl = window.URL.createObjectURL(blob);
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          a.remove();

          this.res.bodyType = 'text';
          this.res.body = 'filename';
        }
        let h = '';
        response.headers.forEach((value, key) => {
          h += `<p><b>${key}:</b> <font color="#aaa">${value}</font></p>`;
        });
        this.res.headers = h;
        this.res.status = response.status;
        this.res.err = '';
      } catch (err) {
        this.res.err = err.message;
      }

      this.showResult = true;
      this.loading = false;
    },
    // onBodyClick() {
    //   const dom = this.$refs.copyDom;
    //   const selection = window.getSelection();
    //   const range = document.createRange();
    //   range.selectNodeContents(dom);
    //   selection.removeAllRanges();
    //   selection.addRange(range);
    //   document.execCommand('copy');
    //   selection.removeAllRanges();
    //   this.$message.success('复制成功');
    // },
  },
};
</script>
