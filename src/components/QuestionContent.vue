<template>
  <article class="question-content-editor">
    <div class="empty" v-if="content.length === 0">
      Contenu vide.
      <span v-if="!preview">Vous pouvez ajouter un élément ci-dessous !</span>
    </div>

    <div class="question-content-item media" v-for="(item, i) in content" :key="i">
      <div class="media-left">
        <b-icon icon="text" size="is-medium" v-if="item.type === 'text'"></b-icon>
        <b-icon icon="format-quote-close" size="is-medium" v-else-if="item.type === 'quote'"></b-icon>
        <b-icon icon="image" size="is-medium" v-else-if="item.type === 'picture'"></b-icon>
        <b-icon icon="movie" size="is-medium" v-else-if="item.type === 'movie'"></b-icon>
        <b-icon icon="headphones" size="is-medium" v-else-if="item.type === 'sound'"></b-icon>
      </div>

      <div class="media-content" v-if="item.type === 'text'">
        <div class="content" v-if="preview" v-html="md(item.text)"></div>
        <b-input type="textarea"
                 v-else
                 v-model="item.text"
                 @input="update"
                 placeholder="Entrez le texte ici. Markdown est supporté."
                 icon-right="language-markdown"
                 rows="5"
        />
      </div>

      <div class="media-content" v-else-if="item.type === 'quote'">
        <div class="content" v-if="preview">
          <blockquote>
            <div v-html="md(item.text)" />
            <p v-if="item.author">— <em v-html="mdInline(item.author)" /></p>
          </blockquote>
        </div>
        <template v-else>
          <b-field>
            <b-input type="textarea"
                     v-model="item.text"
                     @input="update"
                     placeholder="Entrez la citation ici. Markdown est supporté."
                     icon-right="language-markdown"
                     rows="2"
            />
          </b-field>
          <b-field>
            <b-input type="text"
                     v-model="item.author"
                     @input="update"
                     placeholder="Auteur de la citation (facultatif)"
                     icon="fountain-pen-tip"
                     icon-right="language-markdown"
            />
          </b-field>
        </template>
      </div>

      <div class="media-content" v-else-if="['picture', 'movie', 'sound'].indexOf(item.type) >= 0">
        <div class="content" v-if="preview">
          <figure v-if="item.type === 'picture' && item.__selected_input_source === 'name'">
            <img :src="item.name" :alt="item.alt" />
            <figcaption v-html="mdInline(item.caption)"></figcaption>
          </figure>
          <p v-else><em>Prévisualisation non supportée actuellement.</em></p>
        </div>

        <template v-else>
          <div v-if="item.type === 'picture'">
            <b-field message="Pour un nom de fichier, le fichier devra être placé dans un sous-dossier “assets”." v-if="item.type === 'picture'">
              <b-input type="text"
                       v-model="item.name"
                       @input="update"
                       placeholder="URL ou nom du fichier de l'image"
                       icon="link"
              />
            </b-field>
          </div>
          <div v-else class="field">
            <b-field>
              <b-select v-model="item.__selected_input_source">
                <option v-for="option in itemInputTypes(item.type)" :value="option[0]" :key="option[0]">{{ option[1] }}</option>
              </b-select>

              <b-input type="text"
                       v-model="item[item.__selected_input_source || 'name']"
                       @input="update"
                       :placeholder="itemInputType(item.type, item.__selected_input_source)[2]"
                       expanded
              />
            </b-field>
          </div>

          <b-field>
            <b-input type="text"
                     v-model="item.alt"
                     @input="update"
                     placeholder="Texte alternatif (requis, si possible)"
                     icon="eye-off"
            />
          </b-field>
          <b-field>
            <b-input type="text"
                     v-model="item.caption"
                     @input="update"
                     placeholder="Légende (facultatif)"
                     icon="image-text"
                     icon-right="language-markdown"
            />
          </b-field>
          <b-field>
            <b-input type="text"
                     v-model="item.copyright"
                     @input="update"
                     placeholder="Copyright"
                     icon="copyright"
                     icon-right="language-markdown"
            />
          </b-field>
          <b-field v-if="path !== 'answer'">
            <b-switch v-model="item.hide_copyright" @input="update">
              Masquer le copyright pendant la question<br />
              <small>À utiliser si le copyright révèle la réponse. Le copyright sera affiché avec la réponse.</small>
            </b-switch>
          </b-field>
        </template>
      </div>

      <div class="media-right">
        <a @click="removeItemConfirmation(i, $event)" title="Supprimer"><b-icon icon="delete" /></a>
      </div>
    </div>

    <footer v-if="!preview">
      <div class="button-with-icon">
        <b-icon icon="plus" size="is-medium"></b-icon>
        <span>Ajouter</span>
      </div>

      <button class="button-with-icon" @click="addItem('text')">
        <b-icon icon="text" size="is-medium"></b-icon>
        <span>Texte</span>
      </button>

      <button class="button-with-icon" @click="addItem('quote')">
        <b-icon icon="format-quote-close" size="is-medium"></b-icon>
        <span>Citation</span>
      </button>

      <button class="button-with-icon" @click="addItem('picture')">
        <b-icon icon="image" size="is-medium"></b-icon>
        <span>Image</span>
      </button>

      <button class="button-with-icon" @click="addItem('movie')">
        <b-icon icon="movie" size="is-medium"></b-icon>
        <span>Vidéo</span>
      </button>

      <button class="button-with-icon" @click="addItem('sound')">
        <b-icon icon="headphones" size="is-medium"></b-icon>
        <span>Son</span>
      </button>
    </footer>
  </article>
</template>

<script>
import markdown from '../md'
import { mapState, mapActions } from 'vuex'

export default {
  props: {
    uuid: String,
    path: String
  },

  computed: {
    ...mapState(['preview']),
    content () {
      return this.$store.state.file[this.uuid][this.path].content
    }
  },

  methods: {
    ...mapActions(['updateQuestion']),

    itemInputTypes (itemType) {
      switch (itemType) {
        case 'movie':
          return [
            ['name', 'Fichier', 'URL ou nom du fichier'],
            ['youtube', 'YouTube', 'URL vers une vidéo YouTube'],
            ['dailymotion', 'Dailymotion', 'URL vers une vidéo Dailymotion'],
            ['vimeo', 'Vimeo', 'URL vers une vidéo Vimeo']
          ]
        case 'sound':
          return [
            ['name', 'Fichier', 'URL ou nom du fichier'],
            ['soundcloud', 'SoundCloud', 'URL vers un enregistrement SoundCloud'],
            ['spotify', 'Spotify', 'Lien vers un morceau sur Spotify']
          ]
      }
    },

    itemInputType (itemType, inputSourceType) {
      for (const inputType of this.itemInputTypes(itemType)) {
        if (inputType[0] === inputSourceType) {
          return inputType
        }
      }
    },

    addItem (itemType) {
      switch (itemType) {
        case 'text':
          this.content.push({
            type: 'text',
            text: ''
          })
          break
        case 'quote':
          this.content.push({
            type: 'quote',
            text: '',
            author: ''
          })
          break
        case 'picture':
          this.content.push({
            type: 'picture',
            name: '',
            alt: '',
            caption: '',
            copyright: '',
            hide_copyright: false,
            __selected_input_source: 'name'
          })
          break
        case 'movie':
          this.content.push({
            type: 'movie',
            name: '',
            youtube: null,
            dailymotion: null,
            vimeo: null,
            alt: '',
            caption: '',
            copyright: '',
            hide_copyright: false,
            __selected_input_source: 'name'
          })
          break
        case 'sound':
          this.content.push({
            type: 'sound',
            name: '',
            soundcloud: null,
            spotify: null,
            alt: '',
            caption: '',
            copyright: '',
            hide_copyright: false,
            __selected_input_source: 'name'
          })
          break
      }

      this.update()
    },

    removeItemConfirmation (index, e) {
      // Ctrl+click skips the confirmation
      if (e.ctrlKey) {
        this.removeItem(index)
        return
      }

      this.$buefy.dialog.confirm({
        title: 'Supprimer cet élément ?',
        message: '<small>Astuce : cliquer le bouton de suppression en pressant Ctrl supprime directement l\'élément sans confirmation.</small>',
        type: 'is-danger',
        confirmText: 'Supprimer cet élément',
        cancelText: 'Annuler',
        ariaRole: 'dialog',
        ariaModal: true,
        onConfirm: () => this.removeItem(index)
      })
    },

    removeItem (index) {
      this.content.splice(index, 1)
      this.update()
    },

    update () {
      const question = this.$store.state.file[this.uuid]
      question[this.path].content = this.content
      this.updateQuestion({ uuid: this.uuid, question })
    },

    addPrivateAttributes () {
      const defAndNotNull = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop) &&
        obj[prop] !== undefined &&
        obj[prop] !== null &&
        obj[prop] !== ''

      // We check that all required private attributes are here (e.g. from imports)
      for (const item of this.content) {
        if (defAndNotNull(item, '__selected_input_source') || (item.type !== 'movie' && item.type !== 'sound')) continue

        this.$set(
          item,
          '__selected_input_source',
          defAndNotNull(item, 'name') ? 'name'
            : defAndNotNull(item, 'youtube') ? 'youtube'
              : defAndNotNull(item, 'dailymotion') ? 'dailymotion'
                : defAndNotNull(item, 'vimeo') ? 'vimeo'
                  : defAndNotNull(item, 'soundcloud') ? 'soundcloud'
                    : defAndNotNull(item, 'spotify') ? 'spotify' : 'name'
        )
      }

      this.update()
    },

    md (str) {
      return markdown.render(str)
    },

    mdInline (str) {
      return markdown.renderInline(str)
    }
  },

  mounted () {
    this.addPrivateAttributes()
  },

  watch: {
    content () {
      this.addPrivateAttributes()
    }
  }
}
</script>

<style lang="sass">
article.question-content-editor
  padding: 1rem

  border-radius: 6px
  background-color: var(--color-white)

  .empty
    padding: 1rem
    font-style: italic
    color: var(--color-gray-500)
    text-align: center

  .question-content-item
    .media-left .icon
      color: var(--color-light-earth-500)

  footer
    display: flex
    flex-direction: row
    justify-content: space-between

    margin-top: 1rem
    padding-top: 1rem

    border-top: 1px solid var(--color-gray-100)

    .column
      text-align: center

    .button-with-icon
      display: inline-flex
      flex-direction: column
      align-items: center
      justify-content: space-between

      width: 5rem
      height: 5rem
      padding: .6rem

    div.button-with-icon
      color: var(--color-gray-400)

    button.button-with-icon
      border: dashed 1px var(--color-gray-400)
      border-radius: 6px

      background-color: var(--color-gray-000)
      color: var(--color-gray-700)
      font-size: .95rem

      cursor: pointer

      &:hover, &:active, &:focus
        border: solid 1px var(--color-light-earth-900)
        background-color: var(--color-light-earth-900)
        color: var(--color-white)

        .icon
          color: var(--color-light-earth-100)

      &:focus
        outline: none
        box-shadow: 0 0 0 .4rem var(--color-white), 0 0 0 1rem var(--color-light-earth-400)

      .icon
        color: var(--color-gray-400)
</style>
