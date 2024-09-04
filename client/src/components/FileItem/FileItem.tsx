import React, { useEffect, useState } from "react";

import { useItemList } from "src/contexts/itemListContext";
import { ClientFileJson } from "@backend-types/types";

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
    <div
      className={`item item-${item.id} file-item ${
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
              <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                <path d="M11 16h2v-4.15l1.6 1.55L16 12l-4-4-4 4 1.4 1.4 1.6-1.55Zm-4 5q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM7 6v13Z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              title="Delete File"
              className="file-item__button file-item__button--delete"
            >
              {item.trashed ? (
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                  <path d="m9.4 16.5 2.6-2.6 2.6 2.6 1.4-1.4-2.6-2.6L16 9.9l-1.4-1.4-2.6 2.6-2.6-2.6L8 9.9l2.6 2.6L8 15.1ZM7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM7 6v13Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                  <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2ZM7 6v13Z"></path>
                </svg>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={() => setMoreOpen(true)}
            className="file-item__button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
            >
              <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
            </svg>
          </button>
        )}
      </div>
      <div className={`file-item__more ${moreOpen ? "active" : ""}`}>
        <button
          onClick={() => setMoreOpen(false)}
          className="text-item__more__close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
          >
            <path d="m624-480 96 96v72H516v228l-36 36-36-36v-228H240v-72l96-96v-264h-48v-72h384v72h-48v264Z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default FileItem;
