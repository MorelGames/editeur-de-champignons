<template>
  <div id="app">
    <Header />
    <main :class="{'has-question': is_question_displayed}">
      <QuestionsList />
      <QuestionDetails />
    </main>
    <ValidationModal />
  </div>
</template>

<script>
import Header from './components/Header.vue'
import QuestionDetails from './components/QuestionDetails.vue'
import QuestionsList from './components/QuestionsList.vue'
import ValidationModal from './components/ValidationModal.vue'

import { mapState, mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    Header,
    QuestionsList,
    QuestionDetails,
    ValidationModal
  },

  methods: mapActions(['loadFromBrowser', 'newQuestion']),

  computed: mapState({
    is_question_displayed: state => !!state.current
  }),

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
@import "~bulma/sass/utilities/mixins"

*
  box-sizing: border-box

html
  +tablet
    overflow-y: hidden !important

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

    +mobile
      display: block
      height: auto

      &.has-question
        > nav
          display: none

      &:not(.has-question)
        > article
          display: none
</style>
