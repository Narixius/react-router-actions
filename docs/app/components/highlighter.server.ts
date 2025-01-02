import { createShikiHighlighter, renderCodeToHTML, runTwoSlash } from 'shiki-twoslash'

export const renderSyntax = async (code: string) => {
  const highlighter = await createShikiHighlighter({ theme: 'dark-plus' })
  const regex = /\n?\s*?{?\/\* remove-on-demo-start \*\/[\s\S]*?\/\* remove-on-demo-end \*\/?}?\s*?/g
  code = code.replace(regex, '')
  const html = renderCodeToHTML(
    code,
    'tsx',
    { twoslash: true },
    {
      themeName: 'dark-plus',
    },
    highlighter,
    runTwoSlash(code, 'tsx', {}),
  )
  return html
}
