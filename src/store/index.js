import Vue from 'vue'
import Vuex from 'vuex'

import { saveAs } from 'file-saver'
import { v4 } from 'uuid'

import { ToastProgrammatic as Toast } from 'buefy'

Vue.use(Vuex)

const PREVIEWS = {
  // We'll extract these using only the title in the last part of the
  // URL, without using external services.
  wikis: [
    ['wikipedia.org', 'Wikipédia'],
    ['wiktionary.org', 'Wiktionnaire'],
    ['wikisource.org', 'Wikisource'],
    ['fandom.com', 'Fandom']
  ],
  keys: {
    linkpreview: [
      '80e33552c26cf554050170dad63e7c4a',
      '9d63dfa47c62906c037ad943a6a7b509'
    ]
  }
}

function persist (state) {
  localStorage.setItem('cdc-file', JSON.stringify(state.file))
}

export default new Vuex.Store({
  state: {
    file: {},
    current: undefined,
    preview: false
  },
  mutations: {
    load (state, file) {
      state.file = file
    },
    selectQuestion (state, uuid) {
      state.current = uuid
    },
    newQuestion (state) {
      const uuid = v4()
      const question = {
        lang: 'fr',
        nsfw: false,
        categories: [],
        duration: undefined,
        question: {
          text: '',
          content: []
        },
        answer: {
          type: 'qcm',
          answer: '',
          options: [
            { answer: '', valid: false, __removable: true }
          ],
          as_text: true,
          content: [],
          sources: []
        }
      }

      Vue.set(state.file, uuid, question)
      state.current = uuid
    },
    updateQuestion (state, { uuid, question }) {
      Vue.set(state.file, uuid, question)
    },
    deleteQuestion (state, uuid) {
      Vue.delete(state.file, uuid)
      state.current = undefined
    },
    togglePreview (state, preview) {
      state.preview = preview
    }
  },
  actions: {
    loadFromBrowser (context) {
      const local = localStorage.getItem('cdc-file')
      if (!local) return

      try {
        context.commit('load', JSON.parse(local))
      } catch (e) {
        console.error('Unable to load file from local storage: JSON parsing error (did you tamper with the data?).', e)
        console.info('Raw data in the local storage:')
        console.info(local)
      }
    },
    newQuestion (context) {
      context.commit('newQuestion')
      persist(context.state)
    },
    updateQuestion (context, { uuid, question }) {
      context.commit('updateQuestion', { uuid, question })
      persist(context.state)
    },
    deleteQuestion (context, uuid) {
      context.commit('deleteQuestion', uuid)
      persist(context.state)
    },

    /**
     * For each source that's a raw URL, replace it with a Markdown
     * link with the page title.
     *
     * @param state Vuex state.
     * @param dispatch Vuex dispatch method.
     * @param uuid The question UUID. If undefined, will preview all
     *             sources from all questions.
     */
    previewSourceURLs ({ state, dispatch }, uuid) {
      const uuids = uuid ? [uuid] : Object.keys(state.file)
      const promises = []
      let expanded = 0
      const errors = []

      async function previewQuestionSources (uuid) {
        const question = state.file[uuid]
        let modified = false

        for (const i in question.answer.sources) {
          const parts = question.answer.sources[i].trim().split(' ')
          const url = parts[0]

          if (!url.startsWith('http://') && !url.startsWith('https://')) { continue }

          const parsed = new URL(url)

          let name = null
          let site = null
          let section = null

          // First check if that's a link we can preview without any external request
          for (const wiki of PREVIEWS.wikis) {
            if (parsed.hostname.toLowerCase().endsWith(wiki[0])) {
              const pathParts = parsed.pathname.split('/')

              name = decodeURI(pathParts[pathParts.length - 1]).replaceAll('_', ' ')
              site = wiki[1]
              section = parsed.hash ? decodeURI(parsed.hash.substr(1)).replaceAll('_', ' ') : null
              modified = true

              break
            }
          }

          // Then try using an online service
          if (name === null) {
            const resp = await fetch('https://api.linkpreview.net', {
              method: 'POST',
              mode: 'cors',
              body: JSON.stringify({
                key: PREVIEWS.keys.linkpreview[Math.floor(Math.random() * PREVIEWS.keys.linkpreview.length)],
                q: url
              })
            }).catch(e => {
              console.log(e)
              return errors.push(e)
            })

            if (!resp.ok) {
              errors.push(resp)
              continue
            }

            const data = await resp.json()
            name = data.title
          }

          if (name != null) {
            parts[0] = `[_${name}_](${url})` +
              (site ? `, sur ${site}` : '') +
              (section ? `, section _${section}_` : '')

            Vue.set(question.answer.sources, i, parts.join(' '))

            expanded += 1
          }
        }

        if (modified) {
          dispatch('updateQuestion', { uuid, question })
        }

        return true
      }

      for (const uuid of uuids) {
        promises.push(previewQuestionSources(uuid))
      }

      Promise.all(promises).then(results => {
        Toast.open({
          message: `<strong>Toutes les sources ont été prévisualisées.</strong><br /><small>Prévisualisés : ${expanded} — Erreurs : ${errors.length} — Certaines adresses ont pu être prévisualisées grâce à <a href="https://www.linkpreview.net">LinkPreview</a>.</small>`,
          type: 'is-light',
          duration: 6000
        })
        if (errors.length > 0) console.log('Errors while previewing:', errors)
      })
    },

    exportQuestions ({ state }) {
      const blob = new Blob(
        [JSON.stringify(state.file)],
        { type: 'application/json;charset=utf-8' }
      )

      saveAs(blob, 'questions.json')
    }
  },
  modules: {
  }
})
