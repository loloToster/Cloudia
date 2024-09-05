import React, { useEffect, useState } from "react";

import { ClientFileJson } from "@backend-types/types";
import { ITEM_SELECT_CLASS } from "src/consts";
import { useItemList } from "src/contexts/itemListContext";
import Item from "../Item/Item";

import "./FileItem.scss";

function FileItem(props: { item: ClientFileJson }) {
  const { item } = props;

  const {
    handleDelete,
    handleTrash,
    handleRestore,
    handleSelect,
    handleRangeSelect,
    handlePin,
    handleUnpin,
    openSlider,
  } = useItemList();

  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onWindowClick = (e: MouseEvent) => {
      const clickOnItem = e
        .composedPath()
        .some((el) =>
          (el as HTMLElement).classList?.contains(`item-${item.id}`)
        );
      if (clickOnItem) return;

      setMoreOpen(false);
    };

    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, [setMoreOpen, item.id]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey) {
      handleSelect(item.id);
    } else if (e.shiftKey) {
      handleRangeSelect(item.id);
    } else {
      openSlider(item.id);
    }
  };

  const onPin = () => {
    handlePin(item.id);
    setMoreOpen(false);
  };

  const onUnpin = () => {
    handleUnpin(item.id);
    setMoreOpen(false);
  };

  const onRestore = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleRestore(item.id);
  };

  const onDelete = async (e: React.MouseEvent) => {
    e.preventDefault();

    item.trashed ? handleDelete(item.id) : handleTrash(item.id);
  };

  const isImg = item.type === "img";
  const icon = isImg ? `/cdn/${item.id}` : `/icon/${item.title}`;

  return (
    <Item
      item={item}
      className={`${ITEM_SELECT_CLASS} item-${item.id} file-item ${
        isImg ? "" : "file-item--with-icon"
      } ${item.selected ? "file-item--selected" : ""}`}
    >
      <div
        className="file-item__inner"
        onClick={(e) => handleClick(e)}
        key={item.id}
      >
        <img alt="icon" src={icon} className="file-item__icon" />
      </div>
      <div className="file-item__options">
        <div className="file-item__metadata">
          <div className="file-item__title">{item.title}</div>
          <div className="file-item__user">{item.ip}</div>
        </div>
        {item.trashed ? (
          <>
            <button
              onClick={onRestore}
              title="Restore File"
              className="file-item__button file-item__button--download"
            >
              <span className="material-symbols-rounded">
                restore_from_trash
              </span>
            </button>
            <button
              onClick={onDelete}
              title="Delete File"
              className="file-item__button file-item__button--delete"
            >
              {item.trashed ? (
                <span className="material-symbols-rounded">delete_forever</span>
              ) : (
                <span className="material-symbols-rounded">delete</span>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={() => setMoreOpen(true)}
            className="file-item__button"
          >
            <span className="material-symbols-rounded">more_horiz</span>
          </button>
        )}
      </div>
      <div className={`file-item__more ${moreOpen ? "active" : ""}`}>
        <button
          onClick={() => setMoreOpen(false)}
          className="text-item__more__close"
        >
          <span className="material-symbols-rounded">close</span>
        </button>
        <div className="file-item__more__wrapper">
          {item.pinned ? (
            <button onClick={onUnpin}>Unpin</button>
          ) : (
            <button onClick={onPin}>Pin</button>
          )}
          <a href={`/cdn/${item.id}`} target="_blank" rel="noreferrer">
            Open Raw
          </a>
          <a href={`/cdn/${item.id}`} download={item.title}>
            Download File
          </a>
          {Boolean(item.trashed) && (
            <button onClick={onRestore}>Restore Text</button>
          )}
          <button onClick={onDelete} className="danger">
            {item.trashed ? "Delete Permanently" : "Move to trash"}
          </button>
        </div>
      </div>
      {Boolean(item.pinned) && (
        <div className="file-item__pinned">
          <span className="material-symbols-rounded">keep</span>
        </div>
      )}
    </Item>
  );
}

export default FileItem;
