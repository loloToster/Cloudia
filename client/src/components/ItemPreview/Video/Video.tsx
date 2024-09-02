import { PreviewProps } from "../ItemPreview"
import "./Video.scss"

function Video(props: PreviewProps) {
  const { item } = props

  return (
    <div className="pre-video">
      <video src={`/cdn/${item.id}`} controls />
    </div>
  )
}

export default Video
