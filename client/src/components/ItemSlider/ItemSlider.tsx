import { useEffect, useState } from "react";

import { ClientItem } from "@backend-types/types";
import { useItemList } from "src/contexts/itemListContext";
import ItemPreview from "../ItemPreview/ItemPreview";

import "./ItemSlider.scss";

function ItemSlider() {
  const { displayItems, itemSliderInit, closeSlider } = useItemList();

  const [idx, setIdx] = useState(
    itemSliderInit
      ? displayItems.findIndex((i) => itemSliderInit.id === i.id)
      : 0
  );
  const [item, setItem] = useState<ClientItem | null>(null);

  useEffect(() => {
    setItem(displayItems[idx] ?? null);
  }, [idx, displayItems]);

  return (
    <div className="item-slider">
      {item && (
        <div className="sitem">
          <div className="sitem__header">
            <button onClick={closeSlider} className="sitem__header__close">
              <span className="material-symbols-rounded">close</span>
            </button>
            {item.type === "folder" ? (
              <span className="sitem__header__file-icon material-symbols-rounded">
                folder
              </span>
            ) : (
              <img
                className="sitem__header__file-icon"
                src={`/icon/${item.id}`}
                alt=""
              />
            )}
            <div>{item.title}</div>
          </div>
          <div className="sitem__preview">
            <ItemPreview item={item} />
          </div>
          {idx !== 0 && (
            <button
              onClick={() => setIdx((prev) => prev - 1)}
              className="sitem__arrow left"
            >
              <span className="material-symbols-rounded">
                arrow_forward_ios
              </span>
            </button>
          )}
          {idx !== displayItems.length - 1 && (
            <button
              onClick={() => setIdx((prev) => prev + 1)}
              className="sitem__arrow right"
            >
              <span className="material-symbols-rounded">
                arrow_forward_ios
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ItemSlider;
