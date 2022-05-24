const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'VanillaVal',
      formats: ['umd'],
      fileName: (format) => 'vanilla-val.min.js',
    },
  },
})
