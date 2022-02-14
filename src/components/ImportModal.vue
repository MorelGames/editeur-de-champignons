<template>
  <b-modal v-model="importing">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Importer des questions</p>
      </header>

      <section class="modal-card-body" v-if="!result.finished">
        <div class="columns">
          <div class="column">
            <b-field>
              <b-upload v-model="importedFiles" multiple drag-drop expanded accept="application/json">
                <section class="section">
                  <div class="content has-text-centered">
                    <p>
                      <b-icon icon="upload" size="is-large"></b-icon>
                    </p>
                    <p>Glissez ici les fichiers à importer, ou cliquez pour les envoyer</p>
                  </div>
                </section>
              </b-upload>
            </b-field>

            <aside class="import-previews">
              <div class="import-preview" v-for="(preview, file, index) of importedFilesPreviews" :key="index" :class="{'is-invalid': !Number.isInteger(preview)}">
                <p class="is-name">{{ file }}</p>

                <p class="is-status" v-if="Number.isInteger(preview)">{{ preview }} question{{ preview > 1 ? 's' : '' }}</p>
                <p class="is-status" v-else-if="preview === 'bad-type'">Mauvais type (JSON requis)</p>
                <p class="is-status" v-else-if="preview === 'invalid'">Format invalide</p>
                <p class="is-status" v-else-if="preview === 'unparsable'">Fichier illisible (JSON invalide)</p>

                <button class="delete is-small" type="button" @click="deleteFileImport(file)" title="Ne pas importer ce fichier"></button>
              </div>
            </aside>
          </div>

          <div class="column">
            <b-field
              label="En cas de conflit…"
              message="Il y a conflit si une question importée a le même identifiant unique (UUID) qu'une question existante. Cela se produit lorsque vous importez des questions précédemment exportées. Évitez de regénérer cette identifiant pour les questions utilisées en production, car cela réinitialise la difficulté calculée."
              class="has-vertical-radios"
            >
              <b-radio v-model="conflictsResolution"
                       native-value="overwrite">
                Remplacer la question existante par la nouvelle
              </b-radio>
              <b-radio v-model="conflictsResolution"
                       native-value="keep">
                Conserver la question existante, et ne pas importer la nouvelle
              </b-radio>
              <b-radio v-model="conflictsResolution"
                       native-value="duplicate">
                Conserver les deux questions (la question importée aura un identifiant unique regénéré)
              </b-radio>
            </b-field>
          </div>
        </div>
      </section>

      <section class="modal-card-body" v-else>
        <p><strong>Les fichiers valides ont été importés avec succès.</strong></p>
        <p>{{ result.imported }} questions importées (dont {{ result.duplicated }} dupliquée(s)), et {{ result.ignored }} question(s) ignorées car la question existait déjà.</p>
        <p v-if="result.invalid.length > 0" class="is-invalid-files">Ces fichiers n'ont pas été importés car ils étaient invalides (pas du JSON, JSON invalide, ou JSON ne correspondant pas au schéma) : {{ result.invalid.join(', ') }}</p>
      </section>
      <footer class="modal-card-foot">
        <p></p>
        <b-button @click="doImport" type="is-primary" :disabled="!canImport || result.importing" :loading="result.importing" v-if="!result.finished">Importer</b-button>
        <b-button @click="closeImport()" :disabled="result.importing">Fermer</b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { v4 } from 'uuid'

import { validateQuestions } from '@/store'

export default {
  data () {
    return {
      importedFiles: [],
      importedFilesPreviews: {},
      conflictsResolution: 'overwrite', // overwrite, keep, duplicate
      result: {
        finished: false,
        importing: false,
        imported: 0,
        duplicated: 0,
        ignored: 0,
        invalid: []
      }
    }
  },
  computed: {
    ...mapState({
      getImporting: state => state.importing,
      existingFile: state => state.file
    }),

    importing: {
      get () {
        return this.getImporting
      },
      set (val) {
        this.setImporting(val)
      }
    },

    canImport () {
      return this.importedFiles.length > 0 && Object.values(this.importedFilesPreviews).some(item => Number.isInteger(item))
    },

    existingUUIDs () {
      return Object.keys(this.existingFile)
    }
  },

  methods: {
    ...mapMutations({
      setImporting: 'importing',
      addQuestion: 'updateQuestion'
    }),
    ...mapActions(['backup']),

    deleteFileImport (fileName) {
      if (Object.prototype.hasOwnProperty.call(this.importedFilesPreviews, fileName)) {
        delete this.importedFilesPreviews[fileName]
      }

      const index = this.importedFiles.findIndex(file => file.name === fileName)
      this.importedFiles.splice(index, 1)
    },

    doImport () {
      this.backup().then(() => {
        this.result.importing = true
        const promises = []

        for (const file of this.importedFiles) {
          if (file.type !== 'application/json') {
            continue
          }

          promises.push(file.text().then(text => {
            try {
              const parsedFile = JSON.parse(text)
              if (validateQuestions(parsedFile).valid) {
                for (const uuid in parsedFile) {
                  if (!this.existingUUIDs.includes(uuid) || this.conflictsResolution === 'overwrite') {
                    // No conflict, or overwrite enabled, no question
                    this.addQuestion({ uuid, question: parsedFile[uuid] })
                    this.result.imported++
                  } else if (this.conflictsResolution === 'duplicate') {
                    // If we want to duplicate we regenerate a UUID
                    this.addQuestion({ uuid: v4(), question: parsedFile[uuid] })
                    this.result.imported++
                    this.result.duplicated++
                  } else {
                    // Else (keep) we do nothing
                    this.result.ignored++
                  }
                }
              } else {
                this.result.invalid.push(file.name)
              }
            } catch (e) {
              this.result.invalid.push(file.name)
            }
          }))
        }

        Promise.all(promises).then(() => {
          this.result.importing = false
          this.result.finished = true
        })
      })
    },

    closeImport () {
      this.importing = false
      this.result = {
        finished: false,
        importing: false,
        imported: 0,
        duplicated: 0,
        ignored: 0,
        invalid: []
      }
      this.importedFiles = []
      this.importedFilesPreviews = {}
    }
  },

  watch: {
    importedFiles () {
      for (const file of this.importedFiles) {
        if (!Object.prototype.hasOwnProperty.call(this.importedFilesPreviews, file.name)) {
          if (file.type !== 'application/json') {
            this.$set(this.importedFilesPreviews, file.name, 'bad-type')
            continue
          }

          file.text().then(text => {
            try {
              const parsedFile = JSON.parse(text)
              if (!validateQuestions(parsedFile).valid) {
                this.$set(this.importedFilesPreviews, file.name, 'invalid')
              } else {
                this.$set(this.importedFilesPreviews, file.name, Object.keys(parsedFile).length)
              }
            } catch (e) {
              this.$set(this.importedFilesPreviews, file.name, 'unparsable')
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/derived-variables"

// Fixes radio boxes side by side instead of one per line
.field.has-vertical-radios
  .field-body > .field.has-addons
    flex-direction: column

.modal-card-body
  .import-preview
    display: flex
    flex-direction: row
    align-items: center

    &.is-invalid
      p.is-name
        color: $orange

    p.is-name
      flex: 4
      font-family: var(--family-monospace)
      font-size: .9rem

    p.is-status
      font-size: .8rem
      color: var(--color-gray-700)
      margin-right: .4rem

  .is-invalid-files
    margin-top: .6rem
    font-size: .9rem
    font-style: italic

.modal-card-foot
  display: flex
  flex-wrap: wrap
  align-items: flex-end

  p
    flex: 10

  button
    align-self: flex-end
    margin: auto 0
</style>
