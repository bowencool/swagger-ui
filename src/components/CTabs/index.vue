<style lang="less">
.c-tabs {
  &__titles {
    span {
      color: #aaa;
      cursor: pointer;
      padding: 5px 0;
      &:not(:last-child)::after {
        content: '|';
        margin-left: 5px;
        color: #ddd;
      }
      & + span {
        padding-left: 5px;
      }
      &.on {
        color: #fff;
      }
    }
  }
}
</style>

<template>
  <div class="c-tabs">
    <p class="c-tabs__titles">
      <!-- eslint-disable vue/no-parsing-error -->
      <!-- <slot v-for="(t,i) in titles"
            :name="title+i"> -->
      <span
        v-for="(t, i) in titles"
        :class="{ on: t.value === value }"
        :key="i"
        @click="value = t.value"
      >{{ t.title }}</span>
      <!-- </slot> -->
    </p>
    <slot></slot>
  </div>
</template>

<script>
import CTabPane from './CTabPane';

export default {
  name: 'c-tabs',
  Pane: CTabPane,
  props: {
    defaultValue: String,
  },
  data() {
    return {
      value: undefined,
      titles: [],
    };
  },
  created() {
    this.value = this.defaultValue;
  },
  mounted() {
    const panes = this.$children.filter(
      vm => vm.$options._componentTag === 'c-tab-pane', // eslint-disable-line
    );
    this.titles = panes.map(({ title, value }) => ({ title, value }));
  },
};
</script>
