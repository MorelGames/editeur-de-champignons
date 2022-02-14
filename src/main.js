import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import store from './store'

import { Button, Checkbox, Dialog, Dropdown, Field, Input, Icon, Modal, Radio, Rate, Select, Switch, Tag, Taginput, Toast, Upload } from 'buefy'
import './sass/base.sass'

[Button, Checkbox, Dialog, Dropdown, Field, Input, Icon, Modal, Radio, Rate, Select, Switch, Tag, Taginput, Toast, Upload].forEach(p => Vue.use(p))

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
