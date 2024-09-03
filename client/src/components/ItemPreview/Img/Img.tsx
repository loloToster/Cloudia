import { useEffect, useRef } from "react"
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch"

import { PreviewProps } from "../ItemPreview"

import "./Img.scss"

function ImgInner(props: PreviewProps) {
  const { item } = props
  const { centerView } = useControls()

  const lastItemId = useRef("")

  useEffect(() => {
    if (lastItemId.current === item.id) return
    lastItemId.current = item.id
    centerView(1, 0)
  }, [item, centerView])

  return (
    <TransformComponent>
      <img alt={item.title} src={`/cdn/${item.id}`} />
    </TransformComponent>
  )
}

function Img(props: PreviewProps) {
  return (
    <div className="pre-img">
      <TransformWrapper
        limitToBounds={false}
        wheel={{ step: 1, smoothStep: 0.005 }}
        onZoomStop={
          (ref) => {
            if (ref.state.scale === 1) {
              ref.centerView()
            }
          }
        }>
        <ImgInner {...props} />
      </TransformWrapper>
    </div>
  )
}

export default Img
