import Vue from 'vue'
import Vuex from 'vuex'
import { v4 } from 'uuid'

Vue.use(Vuex)

function persist (state) {
  localStorage.setItem('cdc-file', JSON.stringify(state.file))
}

export default new Vuex.Store({
  state: {
    file: {},
    current: undefined
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
        difficulty: 1,
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
    }
  },
  modules: {
  }
})
