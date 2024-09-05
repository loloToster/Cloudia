import { useEffect, useRef, useState } from "react";

import { ClientItem } from "@backend-types/types";
import { useItemList } from "src/contexts/itemListContext";
import ItemPreview from "../ItemPreview/ItemPreview";

import "./ItemSlider.scss";

type IdFunc = (id: string) => void;

function ItemSlider() {
  const {
    displayItems,
    itemSliderInit,
    closeSlider,
    handlePin,
    handleUnpin,
    handleDelete,
    handleTrash,
    handleRestore,
  } = useItemList();

  const [idx, setIdx] = useState(
    itemSliderInit
      ? displayItems.findIndex((i) => itemSliderInit.id === i.id)
      : 0
  );
  const [item, setItem] = useState<ClientItem | null>(null);

  const movingItem = useRef<string | null>(null);

  useEffect(() => {
    if (movingItem.current) {
      let newIdx = displayItems.findIndex((i) => i.id === movingItem.current);
      newIdx = newIdx < 0 ? idx : newIdx;
      setIdx(newIdx);
      setItem(displayItems[newIdx] ?? null);
    } else {
      setItem(displayItems[idx] ?? null);
    }
  }, [idx, displayItems]);

  const onMoveAction = (action: IdFunc) => {
    if (!item) return;
    movingItem.current = item.id;
    action(item.id);
  };

  const onRemovalAction = (action: IdFunc) => {
    if (!item) return;
    action(item.id);
    closeSlider();
  };

  const onChangeIdx = (offset: number) => {
    movingItem.current = null;
    setIdx((prev) => prev + offset);
  };

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
            <div className="sitem__header__title">{item.title}</div>
            {item.pinned ? (
              <button title="Unpin" onClick={() => onMoveAction(handleUnpin)}>
                <span className="material-symbols-rounded pinned">keep</span>
              </button>
            ) : (
              <button title="Pin" onClick={() => onMoveAction(handlePin)}>
                <span className="material-symbols-rounded">keep</span>
              </button>
            )}
            {(item.type === "img" || item.type === "file") && (
              <button title="Download">
                <a href={`/cdn/${item.id}`} download={item.title}>
                  <span className="material-symbols-rounded">download</span>
                </a>
              </button>
            )}
            {item.trashed ? (
              <>
                <button
                  title="Restore"
                  onClick={() => onRemovalAction(handleRestore)}
                >
                  <span className="material-symbols-rounded">
                    restore_from_trash
                  </span>
                </button>
                <button
                  title="Delete Permanently"
                  onClick={() => onRemovalAction(handleDelete)}
                >
                  <span className="material-symbols-rounded">
                    delete_forever
                  </span>
                </button>
              </>
            ) : (
              <button
                title="Move to trash"
                onClick={() => onRemovalAction(handleTrash)}
              >
                <span className="material-symbols-rounded">delete</span>
              </button>
            )}
          </div>
          <div className="sitem__preview">
            <ItemPreview item={item} />
          </div>
          {idx !== 0 && (
            <button
              onClick={() => onChangeIdx(-1)}
              className="sitem__arrow left"
            >
              <span className="material-symbols-rounded">
                arrow_forward_ios
              </span>
            </button>
          )}
          {idx !== displayItems.length - 1 && (
            <button
              onClick={() => onChangeIdx(1)}
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
