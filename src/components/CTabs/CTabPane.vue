<template>
  <div
    v-if="$parent.value === value"
    class="c-tab-pane"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'c-tab-pane',
  props: {
    value: {
      type: String,
      required: true,
    },
    title: {
      type: String, // todo Vnode
      required: true,
    },
  },
};
</script>
