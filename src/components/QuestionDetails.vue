<template>
  <article class="question-editor">
    <template v-if="current_uuid">
      <div class="level-single">
        <b-dropdown v-model="question.answer.type" aria-role="list" @input="update">

          <template v-if="question.answer.type === 'text'" #trigger>
            <b-button
              label="Texte"
              type="is-primary"
              icon-left="lead-pencil"
              icon-right="menu-down"
              size="is-medium" />
          </template>

          <template v-else-if="question.answer.type === 'qcm'" #trigger>
            <b-button
              label="QCM"
              type="is-primary"
              icon-left="format-list-bulleted-square"
              icon-right="menu-down"
              size="is-medium" />
          </template>

          <template v-else-if="question.answer.type === 'geo'" #trigger>
            <b-button
              label="Carte"
              type="is-primary"
              icon-left="map"
              icon-right="menu-down"
              size="is-medium" />
          </template>

          <template v-else-if="question.answer.type === 'drawing'" #trigger>
            <b-button
              label="Dessin"
              type="is-primary"
              icon-left="draw"
              icon-right="menu-down"
              size="is-medium" />
          </template>

          <template v-else #trigger>
            <b-button
              :label="question.answer.type"
              type="is-primary"
              icon-left="crosshairs-question"
              icon-right="menu-down"
              size="is-medium" />
          </template>

          <b-dropdown-item value="text" aria-role="listitem">
            <div class="media">
              <b-icon class="media-left" icon="lead-pencil"></b-icon>
              <div class="media-content">
                <h3>Texte</h3>
                <small>La réponse doit être écrite directement.</small>
              </div>
            </div>
          </b-dropdown-item>

          <b-dropdown-item value="qcm" aria-role="listitem">
            <div class="media">
              <b-icon class="media-left" icon="format-list-bulleted-square"></b-icon>
              <div class="media-content">
                <h3>QCM</h3>
                <small>
                  La ou les réponses sont choisies parmi une liste de propositions.<br />
                  Ce type de question peut également être posée sans les propositions, aléatoirement.
                </small>
              </div>
            </div>
          </b-dropdown-item>

          <b-dropdown-item value="geo" aria-role="listitem">
            <div class="media">
              <b-icon class="media-left" icon="map"></b-icon>
              <div class="media-content">
                <h3>Carte</h3>
                <small>La réponse doit être sélectionnée sur une carte.</small>
              </div>
            </div>
          </b-dropdown-item>

          <b-dropdown-item value="drawing" aria-role="listitem">
            <div class="media">
              <b-icon class="media-left" icon="draw"></b-icon>
              <div class="media-content">
                <h3>Dessin</h3>
                <small>
                  La réponse doit être dessinée.<br />
                  Des outils de dessin simples (couleur, taille de brosse, remplissage, etc.) sont proposés.
                </small>
              </div>
            </div>
          </b-dropdown-item>
        </b-dropdown>

        <b-input type="text"
                 placeholder="Écrivez la question ici…"
                 class="is-display"
                 size="is-medium"
                 icon-right="language-markdown"
                 v-model="question.question.text"
                 @input="update"
                 ref="questionInput"
                 spellcheck="true"
        />

        <a @click="deleteQuestionConfirmation"><b-icon icon="delete" size="is-medium" /></a>
      </div>

      <section class="section">
        <div class="level-single is-spaced">
          <b-field label="Catégories" :message="['La première catégorie est la principale ; elle sera affichée en jeu.', 'Les autres filtrent les questions.']" class="level-main">
            <b-taginput v-model="question.categories"
                        @input="update"
                        autocomplete
                        :data="known_categories_filtered"
                        :allow-new="true"
                        @typing="filterKnownCategories"
                        :placeholder="question.categories.length === 0 ? 'Nouvelle catégorie…' : 'Ajouter une autre catégorie…'"
                        aria-close-label="Supprimer cette catégorie"
                        ref="tagInputCategories"
            >
              <template #selected="props">
                <b-tag
                  v-for="(tag, index) in props.tags"
                  :key="index"
                  :type="index === 0 ? 'is-primary' : 'is-link'"
                  :tabstop="false"
                  closable
                  @close="$refs.tagInputCategories.removeTag(index, $event)">
                  {{ tag }}
                </b-tag>
              </template>
            </b-taginput>
          </b-field>

          <b-field label="Durée" :message="['Temps laissé pour répondre, en secondes.', 'La valeur par défaut dépend du type de question.']">
            <b-input v-model="question.duration" @input="update" type="number" icon-right="alpha-s" />
          </b-field>

          <b-field label="Langue">
            <b-input v-model="question.lang" @input="update" />
          </b-field>

          <b-field label="Public cible" message="Les questions 18+ sont filtrables.">
            <b-switch v-model="question.nsfw" @input="update">
              <abbr title="Not Safe for Work (déconseillé aux jeunes, pour le travail, etc.)">NSFW</abbr>
            </b-switch>
          </b-field>
        </div>
      </section>

      <div class="columns">
        <div class="column is-half">
          <section class="section">
            <header class="titles">
              <h3 class="title is-5">Question</h3>
              <p class="subtitle is-6">
                Contenu affiché lorsque la question est posée, pour donner du contexte supplémentaire si nécessaire.
                La réponse ne doit pas être donnée ici.
              </p>
            </header>

            <QuestionContent :uuid="current_uuid" path="question" />
          </section>
          <section class="section">
            <header class="titles">
              <h3 class="title is-5">Sources</h3>
              <p class="subtitle is-6">
                Précisez ici les sources de la question, pour permettre aux joueurs⋅euses d'approfondir le sujet.
              </p>
            </header>

            <b-field :message="['Chaque ligne sera affichée comme une source séparée, dans une liste. Markdown est supporté, ligne par ligne.', 'Les sources ne sont affichées que pendant la phase de correction, donc vous pouvez y révéler la réponse.']">
              <b-input type="textarea" v-model="sources" icon-right="language-markdown" />
            </b-field>
          </section>
        </div>

        <div class="column is-half">
          <section class="section">
            <div class="titles-with-button">
              <header class="titles">
                <h3 class="title is-5">Réponse</h3>
                <p class="subtitle is-6">
                  Quelle est la bonne réponse à la question ?
                </p>
              </header>
              <b-button v-if="question.answer.type === 'qcm'"
                        @click="addQCMOption"
                        type="is-primary"
                        rounded
                        icon-left="plus">
                Réponse
              </b-button>
            </div>

            <template v-if="question.answer.type === 'text'">
              <b-field message="Pour les questions textuelles, entrez le texte de la réponse. La correction sera manuelle, et sera pré-faite en normalisant la réponse pour la comparer à ce qui a été entré par les participant⋅e⋅s.">
                <b-input v-model="question.answer.answer" @input="update" placeholder="Entrez la réponse ici…" />
              </b-field>
            </template>

            <div v-else-if="question.answer.type === 'qcm'" ref="answerOptions">
              <b-field>
                Indiquez toutes les propositions de réponse, et cochez la ou les bonnes réponses. L'ordre n'a pas
                d'importance : les réponses seront affichées mélangées.
              </b-field>
              <b-field v-for="(option, i) in question.answer.options" :key="i" grouped>
                <b-checkbox v-model="option.valid" @input="update" />
                <b-input v-model="option.answer"
                         @input="update"
                         @keyup.enter.native="addQCMOption"
                         @keyup.delete.native="deleteQCMOptionIfEmpty(i, $event)"
                         placeholder="Entrez la réponse ici…"
                         expanded
                />
                <b-button @click="deleteQCMOptionConfirmation(i, $event)"
                          v-if="question.answer.options.length > 1"
                          type="is-ghost"
                          title="Supprimer">
                  <b-icon icon="delete" />
                </b-button>
              </b-field>
              <b-field>
                <b-switch v-model="question.answer.as_text" @input="update">
                  Proposer également cette question sans les propositions<br />
                  <small>
                    Si activé, cette question pourra être proposée sans les réponses, tel une question textuelle.
                    La correction utilisera la bonne réponse ci-dessous.
                  </small>
                </b-switch>
              </b-field>
            </div>

            <template v-else-if="question.answer.type === 'geo'">
              <em>Pas encore disponible</em>
            </template>

            <div v-else-if="question.answer.type === 'drawing'" class="content">
              <p class="no-answer">
                Il n'y a aucune réponse à configurer pour les questions dont la réponse est un dessin : nous n'analysons
                pas automatiquement les dessins pour corriger ; la réponse est faite à la main.
              </p>
              <p class="no-answer">
                <strong>Cependant</strong>, n'oubliez pas de donner une référence de correction (par exemple, une image)
                dans les explications ci-dessous !
              </p>
            </div>
          </section>

          <section class="section">
            <header class="titles">
              <h3 class="title is-5">Explications</h3>
              <p class="subtitle is-6">
                Quelques éléments pour donner des détails sur la réponse, afin que les joueurs quittent la partie avec
                un peu de culture générale en plus !
              </p>
            </header>

            <QuestionContent :uuid="current_uuid" path="answer" />
          </section>
        </div>
      </div>
    </template>

    <div class="no-question-selected" v-else>
      <h3>Vous n'avez sélectionné aucune question.</h3>
      <p>Choisissez-en une à droite, ou <a @click="newQuestion">créez-en une nouvelle</a>.</p>
      <p class="is-tip">
        Quand vous aurez fini, vous pourrez exporter toutes les questions dans un fichier, en haut à droite. En
        attendant, tout est automatiquement sauvegardé dans votre navigateur.
      </p>
    </div>
  </article>
</template>

<script>
import QuestionContent from './QuestionContent'
import { mapState, mapActions } from 'vuex'

export default {
  components: {
    QuestionContent
  },

  data () {
    return {
      known_categories_filtered: []
    }
  },

  computed: {
    ...mapState({
      current_uuid: state => state.current,
      question: state => state.file[state.current],
      known_categories: state => [...new Set(Object.values(state.file).map(question => question.categories).flat())]
    }),

    sources: {
      get () {
        return this.question.answer.sources.join('\n')
      },
      set (value) {
        this.question.answer.sources = value.split('\n')
        this.update()
      }
    }
  },

  methods: {
    ...mapActions(['newQuestion', 'updateQuestion', 'deleteQuestion']),

    filterKnownCategories (text) {
      this.known_categories_filtered = this.known_categories.filter(c => c.toLowerCase().indexOf(text.toLowerCase()) >= 0)
    },

    update () {
      this.updateQuestion({ uuid: this.current_uuid, question: this.question })
    },

    focusLastQCMOption () {
      if (this.$refs.answerOptions) {
        this.$nextTick(() => {
          const nodes = this.$refs.answerOptions.querySelectorAll('input[type=text]')
          if (nodes) {
            nodes[nodes.length - 1].focus()
          }
        })
      }
    },

    addQCMOption () {
      if (!this.question.answer.options) {
        this.$set(this.question.answer, 'options', [])
      }

      this.question.answer.options.push({
        answer: '', valid: false, __removable: true
      })

      this.update()
      this.focusLastQCMOption()
    },

    deleteQCMOptionIfEmpty (index, e) {
      if (!this.question.answer.options || !this.question.answer.options[index]) return

      if (!this.question.answer.options[index].answer) {
        if (this.question.answer.options[index].__removable && this.question.answer.options.length > 1) {
          this.deleteQCMOption(index)
          this.focusLastQCMOption()
        } else {
          this.question.answer.options[index].__removable = true
        }
      } else {
        this.question.answer.options[index].__removable = false
      }
    },

    deleteQCMOptionConfirmation (index, e) {
      // Ctrl+click skips the confirmation
      if (e.ctrlKey) {
        this.deleteQCMOption(index)
        return
      }

      this.$buefy.dialog.confirm({
        title: 'Supprimer cette question ?',
        message: `Vous supprimez l'option de réponse «&nbsp;<strong>${this.question.answer.options[index].answer}</strong>&nbsp;».<br /><br />
        <small>Astuce : cliquer le bouton de suppression en pressant Ctrl supprime directement la question sans confirmation.</small>`,
        type: 'is-danger',
        confirmText: 'Supprimer cette option',
        cancelText: 'Annuler',
        ariaRole: 'dialog',
        ariaModal: true,
        onConfirm: () => this.deleteQCMOption(index)
      })
    },

    deleteQCMOption (index) {
      this.question.answer.options.splice(index, 1)
      this.update()
    },

    deleteQuestionConfirmation (e) {
      // Ctrl+click skips the confirmation
      if (e.ctrlKey) {
        this.deleteQuestion(this.current_uuid)
        return
      }

      this.$buefy.dialog.confirm({
        title: 'Supprimer cette question ?',
        message: `Vous supprimez la question «&nbsp;<strong>${this.question.question.text}</strong>&nbsp;».<br /><br />
        <small>Astuce : cliquer le bouton de suppression en pressant Ctrl supprime directement la question sans confirmation.</small>`,
        type: 'is-danger',
        confirmText: 'Supprimer cette question',
        cancelText: 'Annuler',
        ariaRole: 'dialog',
        ariaModal: true,
        onConfirm: () => this.deleteQuestion(this.current_uuid)
      })
    }
  },

  watch: {
    question () {
      if (!this.question.answer.options) {
        this.$set(this.question.answer, 'options', [])
      }

      this.$nextTick(() => {
        if (this.question && this.$refs.questionInput) {
          this.$refs.questionInput.focus()
        }
      })
    }
  }
}
</script>

<style lang="sass">
article.question-editor
  width: 100%
  height: 100%

  padding: 1rem

  overflow-y: auto

  .level-single
    display: flex
    align-items: normal

    &:not(:last-child)
      margin-bottom: 1rem

    > .control
      flex: 10
      margin: 0 .4rem

    > a
      align-self: center

    .field:not(:first-child)
      margin-left: 1.5rem

    .field.level-main
      flex: 10

  section.section
    background-color: var(--color-light-earth-0)
    border-radius: 6px

    &:not(:last-child)
      margin-bottom: 1rem

    .titles
      margin-bottom: 1rem

    .titles-with-button
      display: flex
      flex-direction: row

      .titles
        flex: 10

  p.no-answer
    font-style: italic

.no-question-selected
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center

  width: 100%
  height: 100%

  font-size: 1.3rem
  font-family: var(--family-display)

  h3, p
    margin: .4rem
    text-align: center
    width: 60%

    &.is-tip
      margin-top: 2rem
      font-size: 1.1rem

</style>
