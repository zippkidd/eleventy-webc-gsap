import pluginWebc from '@11ty/eleventy-plugin-webc'
import path from 'node:path'
import * as sass from 'sass'
import browserslist from 'browserslist'
import { transform, browserslistToTargets } from 'lightningcss'

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginWebc, {
    components: '_includes/webc/*/*.webc'
  })
  eleventyConfig.addTemplateFormats('scss')
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    compile: async function (inputContent, inputPath) {
      const parsed = path.parse(inputPath)
      // Don't compile file names that start with an underscore
      if (parsed.name.startsWith('_')) {
        return
      }

      // Run file content through Sass
      const result = sass.compileString(inputContent, {
        loadPaths: [
          parsed.dir || '.',
          'node_modules/modern-css-reset/dist',
          this.config.dir.includes
        ],
        sourceMap: true
      })

      // Allow included files from @use or @import to
      // trigger rebuilds when using --incremental
      this.addDependencies(inputPath, result.loadedUrls)

      const targets = browserslistToTargets(browserslist('> 0.2% and not dead'))

      return async () => {
        const { code } = await transform({
          code: Buffer.from(result.css),
          minify: true,
          sourceMap: true,
          targets
        })
        return code
      }
    }
  })
};
