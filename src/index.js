import Vue from 'vue';
// import 'moment/locale/zh-cn';
import {
  Avatar,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Icon,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Switch,
} from 'ant-design-vue';
import Clipboard from './utils/clipboard';
import 'ant-design-vue/dist/antd.min.css';
import './styles/index.less';
import App from './pages/Home';

Vue.directive('clipboard', Clipboard);

Vue.use(Avatar);
Vue.use(Button);
Vue.use(Card);
Vue.use(Col);
Vue.use(Collapse);
Vue.use(Form);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Modal);
Vue.use(Row);
Vue.use(Select);
Vue.use(Spin);
Vue.use(Switch);

Vue.prototype.$message = message;
// Vue.prototype.$notification = Notification;
Vue.prototype.$info = Modal.info;
Vue.prototype.$success = Modal.success;
Vue.prototype.$error = Modal.error;
Vue.prototype.$warning = Modal.warning;
Vue.prototype.$confirm = Modal.confirm;

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
});
