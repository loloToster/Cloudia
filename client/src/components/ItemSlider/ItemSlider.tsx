import { useEffect, useState } from "react"
import { ClientItem } from "@backend-types/types"
import ItemPreview from "../ItemPreview/ItemPreview"

import "./ItemSlider.scss"

interface Props {
  items: ClientItem[]
  initialItem?: ClientItem | null
  onClose?: () => void
}

function ItemSlider(props: Props) {
  const { items, initialItem, onClose } = props

  const [idx, setIdx] = useState(initialItem ? items.findIndex(i => initialItem.id === i.id) : 0)
  const [item, setItem] = useState<ClientItem | null>(null)

  useEffect(() => {
    setItem(items[idx] ?? null)
  }, [idx, items])

  return (
    <div className="item-slider">
      {item && (
        <div className="sitem">
          <div className="sitem__header">
            <button onClick={onClose} className="sitem__header__close">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg>
            </button>
            {item.type === "folder" ? (
              <svg className="sitem__header__file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Z" /></svg>
            ) : (
              <img className="sitem__header__file-icon" src={`/icon/${item.id}`} alt="" />
            )}
            <div>
              {item.title}
            </div>
          </div>
          <div className="sitem__preview">
            <ItemPreview item={item} />
          </div>
          {(idx !== 0) && (
            <button onClick={() => setIdx(prev => prev - 1)} className="sitem__arrow left">
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg>
            </button>
          )}
          {(idx !== items.length - 1) && (
            <button onClick={() => setIdx(prev => prev + 1)} className="sitem__arrow right">
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ItemSlider
