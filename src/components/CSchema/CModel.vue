<script>
import { getName, displayName } from './utils';

export default {
  // filters: {
  //   displayName,
  // },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  render() {
    return (
      <pre style="width: 100%;">
        <i class='json-comment'>
          { this.model.description ? `// ${this.model.description}\n` : '' }
        </i>
        <b class="g-c-ctor">{this.model.name}</b>
        {' {' }
        {this.model.properties
          && Object.entries(this.model.properties).map(([k, v]) => (
            <p key={k}>
              &nbsp;&nbsp;
              <span class='json-key'>
                {k}
              </span>:&nbsp;
              <span domProps-innerHTML={displayName(v)}></span>;
              &nbsp;&nbsp;
              <i class='json-comment'>
                //&nbsp;{v.description}
              </i>
            </p>
          ))}
        {'}'}
      </pre>
    );
  },
};
</script>
