import { PreviewProps } from "../ItemPreview"
import "./Img.scss"

function Img(props: PreviewProps) {
  const { item } = props

  return (
    <div className="pre-img">
      <img alt={item.title} src={`/cdn/${item.id}`} />
    </div>
  )
}

export default Img
