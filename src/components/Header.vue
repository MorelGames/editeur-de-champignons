<template>
  <header class="header">
    <h1>Éditeur de questions ⋅ Culture de champignons</h1>
    <aside>
      <div class="buttons">
        <b-button type="is-primary is-light" size="is-small" rounded>Importer</b-button>
        <b-button type="is-primary" size="is-small" rounded>Exporter</b-button>
      </div>
    </aside>
  </header>
</template>

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
</style>
