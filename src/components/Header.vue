<template>
  <header class="header">
    <h1>Éditeur de questions ⋅ Culture de champignons</h1>
    <aside>
      <b-switch v-model="preview">Prévisualisation</b-switch>
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
      </b-dropdown>
    </aside>
  </header>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'

export default {
  computed: {
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
    ...mapMutations(['togglePreview']),
    ...mapActions(['exportQuestions', 'previewSourceURLs'])
  }
}
</script>

<style lang="sass">
  header.header
    display: flex
    flex-direction: row
    align-items: center

    height: 3rem

    padding: .2rem 1rem

    border-bottom: solid 4px var(--color-light-earth-300)
    background-color: var(--color-light-earth-50)

    h1
      flex: 10
      font-family: var(--family-display)
      font-weight: 600
      font-style: normal
      font-size: 1.4rem

    aside
      display: flex
      flex-direction: row

      .switch
        margin-right: 1rem
</style>
