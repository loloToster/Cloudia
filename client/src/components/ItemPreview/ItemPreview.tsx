import { useEffect, useState } from "react"
import { ClientItem } from "@backend-types/types"

import { SUP_LANGS } from "src/utils/hljs"

import Default from "./Default/Default"
import Img from "./Img/Img"
import Video from "./Video/Video"
import Sound from "./Sound/Sound"
import Pdf from "./Pdf/Pdf"
import Code from "./Code/Code"

export interface PreviewProps {
  item: ClientItem
}

type ItemPreviewComp = (props: PreviewProps) => JSX.Element

const previews: Record<string, ItemPreviewComp> = {
  "": Default,
  "png jpg jpeg gif svg": Img,
  "mp4 webm": Video,
  "wav mp3": Sound,
  "pdf": Pdf,
  [SUP_LANGS.join(" ")]: Code
}

function ItemPreview(props: PreviewProps) {
  const { item } = props

  const [previewComp, setPreviewComp] = useState<string>("")

  useEffect(() => {
    const ext: string | undefined = item.type === "text" ? "txt" : item.id.split(".")[1]?.trim()

    if (ext) {
      for (const key in previews) {
        const exts = key.split(" ")

        if (exts.includes(ext)) {
          setPreviewComp(key)
          return
        }
      }
    }

    setPreviewComp("")
  }, [item])

  const PreviewComp = previews[previewComp]

  return (
    <PreviewComp item={item} />
  )
}

export default ItemPreview
