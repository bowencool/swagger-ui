import { Modal, Form, Input, Switch, AutoComplete } from 'ant-design-vue';
import { API_PRESETS } from '@/config';

export default Form.create({
  onValuesChange(inst, values) {
    // console.log('onValuesChange: ', values);
    if (values.jsonUrl) {
      setTimeout(() => {
        inst.validateFields(['jsonUrl'], (errs, v) => {
          // console.log('callback:', errs, v, values);
          if (!errs) {
            const { origin } = new URL(v.jsonUrl);
            inst.setFieldsValue({ origin });
          }
        });
      }, 40);
    }
  },
})({
  props: ['visible', 'loading', 'initialValue'],
  render() {
    const {
      visible,
      loading,
      initialValue: { jsonUrl, origin, accessToken, usingCurrent },
    } = this;
    const { getFieldDecorator, getFieldValue } = this.form;
    return (
      <Modal
        visible={visible}
        confirmLoading={loading}
        title="设置"
        okText="保存"
        cancelText="取消"
        onCancel={() => this.$emit('cancel')}
        onOk={() => this.$emit('ok')}
      >
        <Form>
          <Form.Item label="Using Current Location">
            {getFieldDecorator('usingCurrent', {
              initialValue: usingCurrent,
            })(<Switch defaultChecked={usingCurrent} />)}
          </Form.Item>
          <Form.Item label="JSON URL">
            {getFieldDecorator('jsonUrl', {
              rules: [
                { required: !getFieldValue('usingCurrent'), message: '必填' },
                { type: 'url', message: '格式不正确' },
              ],
              initialValue: jsonUrl,
            })(
              <AutoComplete
                disabled={getFieldValue('usingCurrent')}
                placeholder="required"
                dataSource={API_PRESETS}
              />,
            )}
          </Form.Item>
          <Form.Item label="Base Origin">
            {getFieldDecorator('origin', {
              rules: [{ type: 'url', message: '格式不正确' }],
              initialValue: origin,
            })(<Input disabled={getFieldValue('usingCurrent')} />)}
          </Form.Item>
          <Form.Item label="Bearer Access Token">
            {getFieldDecorator('accessToken', {
              initialValue: accessToken,
            })(<Input />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  },
});
