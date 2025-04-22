import pluginWebc from '@11ty/eleventy-plugin-webc'
import path from 'node:path'
import * as sass from 'sass'

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginWebc, {
    components: '_includes/webc/*.webc'
  })
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
        loadPaths: [parsed.dir || '.'],
        sourceMap: true
      })

      // Allow included files from @use or @import to
      // trigger rebuilds when using --incremental
      this.addDependencies(inputPath, result.loadedUrls)

      return async () => {
        return result.css
      }
    }
  })
};
