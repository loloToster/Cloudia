import hljs from "highlight.js"

export const SUP_LANGS = hljs.listLanguages().reduce((prev, cur) => {
  return [...prev, cur, ...(hljs.getLanguage(cur)?.aliases ?? [])]
}, [] as string[])
