module.exports = {
  publicPath: '/editeur-de-champignons/',

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: '../locales',
      enableInSFC: false
    }
  },

  pwa: {
    name: 'Éditeur de culture',
    themeColor: '#793b0b',
    msTileColor: '#793b0b',
    manifestOptions: {
      background_color: '#793b0b'
    }
  }
}
