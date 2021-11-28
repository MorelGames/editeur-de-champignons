<template>
  <nav>
    <header>
      <h2>{{ Object.keys(file).length }} question{{ Object.keys(file).length > 1 ? 's' : '' }}</h2>
      <b-button type="is-primary" size="is-small" rounded @click="newQuestion" title="Ctrl + E">Ajouter une question</b-button>
    </header>

    <ul class="questions-list">
      <li v-for="(question, uuid) in file"
          :key="uuid"
          @click="selectQuestion(uuid)"
          :class="{'is-active': uuid === current}"
          :title="question.question.text || 'Question vide'">
        <h3 :class="{'is-empty': !question.question.text}" v-html="mdInline(question.question.text || 'Question vide')"></h3>
        <ul class="meta">
          <li>
            <span v-if="question.answer.type === 'text'">Texte</span>
            <span v-else-if="question.answer.type === 'qcm'">QCM</span>
            <span v-else-if="question.answer.type === 'geo'">Carte</span>
            <span v-else-if="question.answer.type === 'drawing'">Dessin</span>
            <span v-else>{{ question.answer.type }}</span>
          </li>
          <li v-if="question.categories.length > 0">{{ question.categories[0] }}</li>
          <li>{{ ['Très facile', 'Facile', 'Moyen', 'Difficile', 'Très difficile'][question.difficulty - 1] }}</li>
          <li v-if="question.nsfw">NSFW</li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import markdown from '../md'

export default {
  computed: {
    ...mapState(['file', 'current'])
  },

  methods: {
    ...mapMutations(['selectQuestion', 'newQuestion']),

    mdInline (str) {
      return markdown.renderInline(str)
    }
  }
}
</script>

<style lang="sass">
nav
  min-width: 21rem
  width: 20%

  border-right: solid 4px var(--color-light-earth-300)

  > header
    display: flex
    flex-direction: row
    align-items: center

    padding: 1rem .4rem 1rem .6rem

    height: 3rem

    border-bottom: solid 3px var(--color-light-earth-300)

    h2
      flex: 10
      margin: 0
      font-size: 1.2rem

    button
      margin-right: 0

  > ul.questions-list
    margin: 0
    padding: .4rem

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
