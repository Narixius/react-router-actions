type QueryParams = Record<string, string | number | boolean>

type ParsedURL = {
  pathname: string
  search: string
  hash: string
}

/**
 * @license
 * This code was adapted from ufo
 * Original source: https://github.com/unjs/ufo
 * License: MIT
 **/
export function parsePath(input = ''): ParsedURL {
  const [pathname = '', search = '', hash = ''] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1)
  return {
    pathname,
    search,
    hash,
  }
}

/**
 * @license
 * This code was adapted from ufo
 * Original source: https://github.com/unjs/ufo
 * License: MIT
 **/
export function addQueryParams(path: string, params: QueryParams) {
  const parsedPath = parsePath(path)
  const q = new URLSearchParams(parsedPath.search)
  Object.entries(params).forEach(([key, value]) => {
    q.append(key, String(value))
  })

  const searchParams = q.toString()
  const search = searchParams ? (searchParams.startsWith('?') ? '' : '?') + searchParams : ''

  return parsedPath.pathname + search + parsedPath.hash
}
