<template>
  <b-modal v-model="validation.displayed">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title" v-if="validation.why === 'export'">Le fichier exporté contient des erreurs</p>
        <p class="modal-card-title" v-else>Impossible d'importer ces questions</p>
      </header>
      <section class="modal-card-body">
        <p v-if="validation.why === 'export'">
          Le fichier a été exporté avec succès, mais il pourrait ne pas correctement fonctionner. Les erreurs sont listées
          ci-dessous.
        </p>
        <p v-else>
          Il n'a pas été possible d'importer ces questions car le format n'est pas respecté. Veuillez vérifier le format
          et réessayer. Les erreurs sont listées ci-dessous.
        </p>
        <hr>
        <dl v-for="(errors, uuid, i) in groupedErrors" :key="i">
          <dt>
            <span v-html="mdInline(questionFromUUID(uuid))" />
            <small>{{ uuid }}</small>
          </dt>
          <dd>
            <ul v-for="(error, j) of errors" :key="j">
              <li>{{ error.stack }}</li>
            </ul>
          </dd>
        </dl>
      </section>
      <footer class="modal-card-foot">
        <p v-if="validation.result && validation.result.errors">
          {{ validation.result.errors.length }} erreur{{ validation.result.errors.length > 1 ? 's' : '' }}.
        </p>
        <b-button @click="validation.displayed = false">Fermer</b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
import { mapState } from 'vuex'
import markdown from '../md'

export default {
  computed: {
    ...mapState(['file', 'validation']),

    groupedErrors () {
      if (!this.validation.result || !this.validation.result.errors) return {}

      return this.validation.result.errors.reduce(function (r, a) {
        r[a.path[0]] = r[a.path[0]] || []
        a.stack = a.stack
          .replace(`instance.${a.path[0]}.`, '')
          .replace(`instance["${a.path[0]}"].`, '')
          .replace(`undefined.${a.path[0]}.`, '')
          .replace(`undefined["${a.path[0]}"].`, '')
        r[a.path[0]].push(a)
        return r
      }, Object.create(null))
    }
  },
  methods: {
    questionFromUUID (uuid) {
      return this.file[uuid].question.text
    },

    mdInline (str) {
      return markdown.renderInline(str)
    }
  }
}
</script>

<style lang="sass" scoped>
dl
  margin: 1rem 0
  dt
    span
      font-weight: bold
    small
      font-family: monospace
      font-size: .6rem
      display: block
  dd
    margin-left: 1rem
    font-size: .9rem
    font-family: monospace

footer.modal-card-foot
  display: flex
  p
    display: block
    flex: 4
    font-size: .9rem
</style>
