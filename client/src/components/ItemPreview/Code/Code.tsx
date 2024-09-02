import { useEffect, useRef, useState } from "react"
import hljs from "highlight.js"

import { SUP_LANGS } from "src/utils/hljs"
import { PreviewProps } from "../ItemPreview"
import "./Code.scss"

const MAX_HIGHLIGHT_LEN = 20000

function Code(props: PreviewProps) {
  const { item } = props

  const [text, setText] = useState("")

  useEffect(() => {
    if (item.type === "text") {
      setText(item.text)
      return
    }

    fetch(`/cdn/${item.id}`).then(async res => {
      if (!res.ok) return
      setText(await res.text())
    }).catch(console.error)
  }, [item])

  const el = useRef<HTMLElement>(null)

  useEffect(() => {
    el.current?.removeAttribute("data-highlighted")
    el.current?.classList.forEach(c => {
      if (c.startsWith("language-"))
        el.current?.classList.remove(c)
    })

    if (text.length < MAX_HIGHLIGHT_LEN && el.current) {
      const ext: string | undefined = item.id.split(".")[1]?.trim()
      if (ext && SUP_LANGS.includes(ext))
        el.current?.classList.add(`language-${ext}`)

      hljs.highlightElement(el.current)
    }
  }, [text, item])

  return (
    <div className="pre-code">
      <pre>
        <code className="hljs" ref={el}>
          {text}
        </code>
      </pre>
    </div>
  )
}

export default Code
