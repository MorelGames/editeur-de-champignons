<template>
  <nav>
    <header>
      <h2>{{ Object.keys(file).length }} question{{ Object.keys(file).length > 1 ? 's' : '' }}</h2>
      <b-button :type="search ? 'is-primary' : 'is-link'" size="is-small" rounded icon-left="magnify" @click="search = !search"></b-button>
      <b-button type="is-primary" size="is-small" rounded icon-left="plus" @click="newQuestion" title="Ctrl + E">Question</b-button>
    </header>
    <header class="search" v-show="search">
      <input type="text"
             placeholder="Rechercher…"
             v-model="search_term"
             @keyup.esc="search = false"
             ref="searchField" />
    </header>

    <ul class="questions-list">
      <li v-for="(question, uuid) in questions"
          :key="uuid"
          @click="selectQuestion(uuid)"
          :class="{'is-active': uuid === current}"
          :title="question.question.text || 'Question vide'">
        <h3 :class="{'is-empty': !question.question.text}" v-html="mdInline(question.question.text || 'Question vide')"></h3>
        <ul class="meta">
          <li>
            <b-icon size="is-small" icon="lead-pencil" title="Texte" v-if="question.answer.type === 'text'"/>
            <b-icon size="is-small" icon="format-list-bulleted-square" title="QCM" v-else-if="question.answer.type === 'qcm'"/>
            <b-icon size="is-small" icon="map" title="Carte" v-else-if="question.answer.type === 'geo'"/>
            <b-icon size="is-small" icon="draw" title="Dessin" v-else-if="question.answer.type === 'drawing'"/>
            <span v-else>{{ question.answer.type }}</span>
          </li>
          <li v-if="question.categories.length > 0">{{ question.categories[0] }}</li>
          <li v-if="question.nsfw">NSFW</li>
          <li v-if="question.question.text && (question.categories.length === 0 || ((question.answer.type === 'text' && !question.answer.answer) || (question.answer.type === 'qcm' && (!question.answer.options || question.answer.options.length < 2))))"
              title="Un ou plusieurs éléments manquent (catégories ou réponses).">
            <b-icon size="is-small" icon="alert-circle"></b-icon>
          </li>
          <li v-if="question.question.text && question.answer.sources.length === 0 && question.answer.content.length === 0"
              title="Cette question n'a ni explications, ni sources.">
            <b-icon size="is-small" icon="school"></b-icon>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import markdown from '../md'

export default {
  data () {
    return {
      search: false,
      search_term: ''
    }
  },
  computed: {
    ...mapState(['file', 'current']),

    questions () {
      if (!this.search) return this.file

      const term = this.search_term.toLowerCase()
      return Object.fromEntries(Object.entries(this.file).filter(([uuid, question]) => {
        if (question.question.text.toLowerCase().indexOf(term) !== -1) return true

        for (const category of question.categories) {
          if (category.toLowerCase().indexOf(term) !== -1) return true
        }

        if (question.answer.answer && question.answer.answer.toLowerCase().indexOf(term) !== -1) return true

        for (const option of Object.values(question.answer.options || {})) {
          if (option.answer.toLowerCase().indexOf(term) !== -1) return true
        }

        for (const source of question.answer.sources) {
          if (source.toLowerCase().indexOf(term) !== -1) return true
        }

        for (const contentType of ['question', 'answer']) {
          for (const content of question[contentType].content) {
            for (const field of ['text', 'alt', 'caption', 'copyright']) {
              if (Object.prototype.hasOwnProperty.call(content, field) && content[field].toLowerCase().indexOf(term) !== -1) {
                return true
              }
            }
          }
        }

        return false
      }))
    }
  },

  methods: {
    ...mapMutations(['selectQuestion']),
    ...mapActions(['newQuestion']),

    mdInline (str) {
      return markdown.renderInline(str)
    }
  },

  watch: {
    search () {
      if (this.search && this.$refs.searchField) {
        this.$nextTick(() => this.$refs.searchField.focus())
      }
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"

nav
  min-width: 21rem
  width: 20%

  border-right: solid 4px var(--color-light-earth-300)

  +mobile
    width: 100%
    min-width: unset
    border: none

  > header
    display: flex
    flex-direction: row
    align-items: center

    padding: 1rem .4rem 1rem .6rem

    height: 3rem

    border-bottom: solid 3px var(--color-light-earth-300)

    background-color: var(--color-white)

    +mobile
      position: sticky
      top: 3rem

    h2
      flex: 10
      margin: 0
      font-size: 1.2rem

    button
      margin-right: .4rem

      &:last-child
        margin-right: 0

    &.search
      padding: 0

      input[type=text]
        display: block
        width: 100%
        height: 100%
        padding: 1rem .4rem 1rem .6rem
        border: none

        &:focus
          outline: var(--color-light-earth-600) solid .2rem

  > ul.questions-list
    margin: 0
    padding: .4rem

    +tablet
      overflow-y: auto
      overflow-x: hidden

    height: calc(100vh - 6rem)

    > li
      display: block
      padding: .4rem .6rem

      border-radius: 6px
      background-color: var(--color-light-earth-0)

      cursor: pointer

      &:not(:last-child)
        margin-bottom: .4rem

      &:hover, &.is-active
        background-color: var(--color-light-earth-900)

        &, em, strong
          color: var(--color-light-earth-50)

        h3.is-empty
          color: var(--color-dark-earth-700)

      h3
        margin: 0

        // Ellipsis, but after the second line
        overflow: hidden
        display: -webkit-box
        -webkit-line-clamp: 2
        -webkit-box-orient: vertical

        &.is-empty
          font-style: italic

          &, em, strong
            color: var(--color-light-earth-600)

      ul.meta
        display: flex
        flex-direction: row
        align-items: center

        list-style-type: none

        padding: 0
        margin-top: .4rem

        li
          margin: 0 0 0 .2rem
          padding: .1rem .4rem
          background-color: var(--color-light-earth-150)
          border-radius: 4px
          font-size: .9rem
          color: var(--color-light-earth-1000)

          &:first-child
            margin-left: 0
</style>
