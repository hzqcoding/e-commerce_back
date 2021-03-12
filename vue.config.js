module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'assets': '@/assets',
        components: '@/components',
        common: 'components/common',
        content: 'components/content',
        network: '@/network',
        views: '@/views'
      }
    }
  },

  lintOnSave: false
}
