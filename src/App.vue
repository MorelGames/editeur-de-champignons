<template>
  <div id="app">
    <Header />
    <main>
      <QuestionsList />
      <QuestionDetails />
    </main>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import QuestionDetails from './components/QuestionDetails.vue'
import QuestionsList from './components/QuestionsList.vue'

import { mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    Header,
    QuestionsList,
    QuestionDetails
  },

  methods: mapActions(['loadFromBrowser', 'newQuestion']),

  mounted () {
    this.$nextTick(this.loadFromBrowser)

    this._keyListener = function (e) {
      if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.newQuestion()
      }
    }

    document.addEventListener('keydown', this._keyListener.bind(this))
  },

  beforeDestroy () {
    document.removeEventListener('keydown', this._keyListener)
  }
}
</script>

<style lang="sass">
*
  box-sizing: border-box

html, body, #app
  margin: 0
  padding: 0

#app
  font-family: var(--family-sans)
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale

  background-color: var(--color-gray-000)
  color: var(--color-black)

  main
    display: flex
    flex-direction: row

    height: calc(100vh - 2.99rem)
</style>
