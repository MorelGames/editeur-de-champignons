import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import store from './store'

import { Button, Checkbox, Dialog, Dropdown, Field, Input, Icon, Rate, Select, Switch, Tag, Taginput, Toast } from 'buefy'
import './sass/base.sass'

[Button, Checkbox, Dialog, Dropdown, Field, Input, Icon, Rate, Select, Switch, Tag, Taginput, Toast].forEach(p => Vue.use(p))

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
