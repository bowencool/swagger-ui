<style lang="less">
@max-width: 1400px;

.home-page {
  padding-top: 70px;
  &__dashboard {
    max-width: @max-width;
    margin: 0 auto;
  }
  &__header {
    z-index: 6;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    padding: 0 10px;
    background-color: #333;
    box-shadow: 0 2px 9px 0 #252525;
    &__content {
      height: 100%;
      max-width: @max-width;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    &__user {
      margin-right: 10px;
    }
  }
  &__content {
    max-width: @max-width;
    margin: 0 auto;
  }
}
.err-message {
  padding: 20px;
  pre {
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
  }
}
</style>

<template>
  <section class="home-page theme-dark">
    <header class="home-page__header">
      <div class="home-page__header__content">
        <span>
          <a-input
            size="small"
            style="width: 72px;"
            placeholder="身份切换"
            @pressEnter="handleInputEnter"
          ></a-input>
          <a @click="debugLogin(1)"> 用户1</a>
          |
          <a @click="debugLogin(2)">用户2</a>
          |
          <a @click="debugLogin(3)">用户3</a>
          |
          <a @click="debugLogin(4)">用户4</a>
          |
          <a @click="logout">退出登录 </a>
        </span>

        <!-- <a-spin
          :spinning="loading"
          size="small"
        > -->
        <a-input
          :value="pattern"
          style="width: 400px;"
          placeholder="Search: path / title / description"
          @change="handlePattern"
        >
          <a-icon
            slot="prefix"
            :type="loading ? 'loading': 'search'"
            style="color: #fff;"
          ></a-icon>
        </a-input>
        <!-- </a-spin> -->

        <span>
          <a @click="handleOpenSettings">
            <a-icon type="setting"></a-icon> 设置
          </a>

          <span class="home-page__header__user">
            <a-avatar
              :src="user.avatar"
              icon="user"
            ></a-avatar>
          </span>
        </span>

      </div>
    </header>

    <section
      v-if="errorStr"
      class="err-message"
    >
      <pre v-html="errorStr"></pre>
    </section>

    <section
      v-if="data.info"
      class="home-page__dashboard"
    >
      <a-card>
        <h2
          slot="title"
          style="margin: 0;"
        >{{ data.info.title }} ({{ data.info.version }})</h2>
        <a
          slot="extra"
          :href="'mailto:'+data.info.contact.email"
          style="line-height: 36px;"
        >Contact {{ data.info.contact.name }}</a>
        <!-- <p><a
            :href="settings.jsonUrl"
            target="_blank"
          >{{settings.usingCurrent?'':settings.jsonUrl}}</a></p> -->
        <!-- <p>Base Path: {{data.basePath}}</p>
        <p>{{data.info.description}}</p> -->
        <template v-if="user.name">
          <p>当前登录：{{ user.name }}（ id: {{ user.id }} ）</p>
          <p>
            <template>当前身份：</template>
            <template v-if="user.perms && Object.keys(user.perms).length">
              <template v-if="user.perms.isSuper">超级</template>
              <template v-if="user.perms.isAdmin">管理员</template>
              {{ user.perms.summary }}
            </template>
            <template v-else>普通用户</template>
          </p>
          <p v-if="user.__referral !== undefined">__referral：{{ user.__referral }}</p>
          <p v-if="user.__from_referral !== undefined">__from_referral：{{ user.__from_referral }}</p>
        </template>

      </a-card>
    </section>

    <section class="home-page__content">
      <a-collapse
        v-if="data.done && Object.keys(tags).length"
        :bordered="false"
        :default-active-key="initialTabName"
        @change="handleTabChange"
      >
        <a-collapse-panel
          v-for="(tag, tagName) in tags"
          :ref="tagName"
          :key="tagName"
        >
          <template slot="header">
            {{ tagName }}: {{ tag.description }}
          </template>

          <c-api
            v-for="(api, i) in tag.apis"
            :ref="api.path + api.method"
            :key="api.description+i"
            :api="api"
          ></c-api>

        </a-collapse-panel>
      </a-collapse>
    </section>

    <the-settings-form
      :visible="modalVisible"
      :loading="loading"
      :initial-value="settings"
      @ok="handleSettingsOk"
      @cancel="handleSettingsCancel"
    ></the-settings-form>

    <c-back-to-top></c-back-to-top>

  </section>
</template>

<script>
import { getLogoutUrl, getDebugLoginUrl } from '@/config';
import { jsonHighlight } from '@/utils';
import request from '../../utils/request';
import CApi from '../../components/CApi';
import TheSettingsForm from './TheSettingsForm';
import CBackToTop from '../../components/CBackToTop';

// default settings
const settings = {
  jsonUrl:
    localStorage.getItem('jsonUrl')
    || `${window.location.origin}/v2/swagger.json`,
  origin: localStorage.getItem('origin') || window.location.origin,
  accessToken: localStorage.getItem('accessToken') || '',
  usingCurrent: localStorage.getItem('usingCurrent') !== 'false',
};

const provide = {
  definitions: {},
  parameters: {},
  basePath: '/',
  settings,
};

export default {
  name: 'home',
  components: {
    TheSettingsForm,
    CApi,
    CBackToTop,
  },
  provide,
  data() {
    return {
      settings,
      pattern: '',
      data: {
        done: false,
        info: null,
        tags: {},
        basePath: '',
      },
      user: {},
      initialTabName: '',
      initialPath: '',
      loading: false,
      modalVisible: false,
      errorStr: '',
    };
  },
  computed: {
    tags() {
      const {
        pattern,
        data: { tags },
      } = this;
      if (!pattern) {
        return tags;
      }
      const reg = new RegExp(pattern, 'i');
      const newTags = {};
      Object.entries(tags).forEach(([key, tag]) => {
        const newTag = reg.test(tag.name)
          || reg.test(tag.description)
          ? tag
          : Object.assign({}, tag, {
            apis: tag.apis.filter(
              api => (api.description
                      && reg.test(api.description))
                    || (api.path && reg.test(api.path))
                    || (api.summary
                      && reg.test(api.summary)),
            ),
          });
        if (newTag.apis.length) {
          newTags[key] = newTag;
        }
      });
      return newTags;
    },
    title() {
      if (!this.data.info) {
        return 'swagger api';
      }
      return `${this.data.info.title} - ${this.data.info.version}`;
    },
  },
  watch: {
    title(title) {
      window.document.title = title;
    },
  },
  async created() {
    const query = new URLSearchParams(window.location.search);
    // console.log(query.get('tab'));
    this.pattern = query.get('pattern');
    this.initialTabName = query.get('tab');
    this.initialPath = query.get('path') + query.get('method');
    await this.fetchData();
    this.$nextTick(() => setTimeout(() => {
      const el = this.$refs[this.initialPath] || this.$refs[this.initialTabName];
      if (el) {
        window.scrollTo(window.scrollX, el[0].$el.offsetTop - 70);
      }
    }, 200));
    await this.fetchUserProfile();
  },
  methods: {
    handleTabChange(tabNames) {
      const url = new URL(window.location.href);
      const tab = tabNames[tabNames.length - 1];
      if (tab) {
        url.searchParams.set('tab', tabNames[tabNames.length - 1]);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState(null, '', url.href);
    },
    async fetchData() {
      this.loading = true;

      let res;
      const { jsonUrl, usingCurrent } = this.settings;

      try {
        res = await request(
          usingCurrent ? `${window.location.origin}/v2/swagger.json` : jsonUrl,
        );
      } catch (e) {
        this.loading = false;
        if (e.response) {
          const errData = await e.response.json();
          this.errorStr = jsonHighlight(errData);
        } else {
          this.errorStr = e.message;
        }
        throw e;
      }
      const { info, basePath, paths, tags, definitions, parameters } = res;

      this.loading = false;
      this.errorStr = '';

      const newTags = {};
      tags.sort((a, b) => (a.name > b.name ? 1 : -1)).forEach(tag => {
        newTags[tag.name] = tag;
      });

      Object.entries(paths).forEach(([path, wtf]) => {
        let gParameters = [];
        if (Array.isArray(wtf.parameters)) {
          gParameters = wtf.parameters;
          // delete wtf.parameters;
        }
        Object.entries(wtf).forEach(([method, api]) => {
          /* eslint-disable no-param-reassign */
          if (method !== 'parameters') {
            api.method = method;
            api.path = path;
            if (gParameters.length > 0) {
              api.parameters = Array.isArray(api.parameters)
                ? [...gParameters, ...api.parameters]
                : gParameters;
            }
            api.tags.forEach(tag => {
              if ('apis' in newTags[tag]) {
                newTags[tag].apis.push(api);
              } else {
                newTags[tag].apis = [api];
              }
            });
            delete api.tags;
          }
          /* eslint-enable no-param-reassign */
        });
      });

      this.data.tags = newTags;
      this.data.done = true;
      provide.definitions = definitions;
      provide.parameters = parameters;
      provide.basePath = basePath;
      this.data.info = info;
      this.data.basePath = basePath;
    },
    async fetchUserProfile() {
      const {
        settings: { origin, accessToken, usingCurrent },
        data: { basePath },
      } = this;

      const { data } = await request(
        `${
          usingCurrent ? window.location.origin : origin
        }${basePath}/user/profile`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      this.user = data;
    },
    handleOpenSettings() {
      this.modalVisible = true;
    },
    async handleSettingsOk(values) {
      Object.entries(values).forEach(([key, value]) => {
        this.settings[key] = value;
        localStorage.setItem(`${key}`, value);
      });
      await this.fetchData();
      this.modalVisible = false;
      await this.fetchUserProfile();
    },
    handleSettingsCancel() {
      this.modalVisible = false;
    },
    href(path) {
      const { origin, usingCurrent } = this.settings;
      window.location.href = `${
        usingCurrent ? window.location.origin : origin
      }${path}?redirect_uri=${encodeURIComponent(window.window.location.href)}`;
    },
    debugLogin(id) {
      this.href(getDebugLoginUrl(id));
    },
    logout() {
      this.href(getLogoutUrl());
    },
    handleInputEnter(e) {
      if (e.target.value) {
        this.debugLogin(e.target.value);
      }
    },
    handlePattern({ target: { value: pattern } }) {
      this.pattern = pattern;
      const url = new URL(window.location.href);
      if (pattern) {
        url.searchParams.set('pattern', pattern);
      } else {
        url.searchParams.delete('pattern');
      }
      window.history.replaceState(null, '', url.href);
    },
  },
};
</script>
