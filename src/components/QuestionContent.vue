<template>
  <article class="question-content-editor">
    <footer>

    </footer>
  </article>
</template>

<script>
export default {
  props: {
    uuid: String,
    path: String
  },

  computed: {
    content () {
      return this.$store.state.file[this.uuid][this.path].content
    }
  }
}
</script>
