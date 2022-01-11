<template>
  <header class="header">
    <b-button icon-left="arrow-left" type="is-link" aria-label="Retour" v-if="is_question_displayed" @click="unselectQuestion"></b-button>

    <h1><span>Éditeur de questions ⋅ </span>Shroom</h1>

    <aside>
      <b-switch v-model="preview">
        <span>Prévisualisation</span>
        <b-icon icon="language-markdown" />
      </b-switch>
      <b-dropdown aria-role="list" position="is-bottom-left">
        <template #trigger="{ active }">
          <b-button
            label="Menu"
            type="is-primary"
            size="is-small"
            rounded
            :icon-right="active ? 'menu-up' : 'menu-down'" />
        </template>

        <b-dropdown-item aria-role="listitem" disabled>
          <div class="media">
            <b-icon class="media-left" icon="application-import"></b-icon>
            <div class="media-content">
              <h3>Importer (à venir)</h3>
              <small>Importer des questions depuis un fichier JSON</small>
            </div>
          </div>
        </b-dropdown-item>
        <b-dropdown-item aria-role="listitem" @click="exportQuestions">
          <div class="media">
            <b-icon class="media-left" icon="application-export"></b-icon>
            <div class="media-content">
              <h3>Exporter</h3>
              <small>Exporter les questions en JSON compatible avec le jeu</small>
            </div>
          </div>
        </b-dropdown-item>
        <hr class="dropdown-divider">
        <b-dropdown-item aria-role="listitem" @click="previewSourceURLs(null)">
          <div class="media">
            <b-icon class="media-left" icon="flash-red-eye"></b-icon>
            <div class="media-content">
              <h3>Développer les URLs dans les sources</h3>
              <small>Remplace les URLs brutes par des liens avec le titre de la page</small>
            </div>
          </div>
        </b-dropdown-item>
        <b-dropdown-item aria-role="listitem" @click="toggleAnswersVisible()">
          <div class="media">
            <b-icon class="media-left" icon="eye" v-if="answers"></b-icon>
            <b-icon class="media-left" icon="eye-off" v-else></b-icon>

            <div class="media-content">
              <h3 v-if="!answers">Afficher les réponses</h3>
              <h3 v-else>Masquer les réponses</h3>
              <small>Masquez les réponses pour tester les questions…</small>
            </div>
          </div>
        </b-dropdown-item>
      </b-dropdown>
    </aside>
  </header>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['answers']),
    ...mapState({
      is_question_displayed: state => !!state.current
    }),

    preview: {
      get () {
        return this.$store.state.preview
      },
      set (value) {
        this.togglePreview(value)
      }
    }
  },

  methods: {
    ...mapMutations(['togglePreview', 'toggleAnswersVisible', 'unselectQuestion']),
    ...mapActions(['exportQuestions', 'previewSourceURLs'])
  }
}
</script>

<style lang="sass">
  @import "~bulma/sass/utilities/mixins"

  header.header
    display: flex
    flex-direction: row
    align-items: center

    +mobile
      position: sticky
      top: 0
      left: 0
      z-index: 20

    height: 3rem

    padding: .2rem 1rem

    border-bottom: solid 4px var(--color-light-earth-300)
    background-color: var(--color-light-earth-50)

    > button
      margin-right: .4rem

    h1
      flex: 10
      font-family: var(--family-display)
      font-weight: 600
      font-style: normal
      font-size: 1.4rem

      span
        +mobile
          display: none

    aside
      display: flex
      flex-direction: row

      .switch
        margin-right: 1rem

    span.control-label
      > span.icon
        display: none

      +mobile
        > span:not(.icon)
          display: none
        > span.icon
          display: flex
          color: var(--color-light-earth-900)
</style>
