import pretty from 'pretty-bytes'
import request from 'superagent'

import config from 'infrastructure/config'

const OPTIMIZE_SERVICE = config.endpoint

const optimize = async (imgs) => {
  await Promise.all(
    imgs.map(img => {
      if (img.url.indexOf(OPTIMIZE_SERVICE) === 0 ||
        img.url.indexOf('data:') === 0 ||
        img.contentType === 'image/svg+xml') {
        img.optimizedPath = img.url
        img.optimizedSize = img.size
        img.prettyOptimizedSize = '✓'

        return Promise.resolve()
      }

      let p = `${OPTIMIZE_SERVICE}/u/test?url=${encodeURIComponent(img.url)}`

      if (img.imgTag && img.imgTag.shouldResize) {
        p = `${p}&w=${img.imgTag.displayed.width}&h=${img.imgTag.displayed.height}&m=crop`
      }

      return request
        .get(p)
        .then(res => {
          img.optimizedPath = p
          img.optimizedSize = parseInt(res.headers['content-length'], 10)
          img.prettyOptimizedSize = pretty(img.optimizedSize || 0)
        })
        .catch(error => {
          img.optimizedPath = img.url
          img.optimizedSize = img.size
          img.prettyOptimizedSize = 'N/A'

          console.log(error, {
            url: img.url,
            p: p
          })
        })
    })
  )

  return imgs
}

export default optimize
