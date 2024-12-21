import React, { useState } from "react";
import { Link } from "react-router-dom";

import { ClientFolderJson } from "@backend-types/types";
import { ITEM_SELECT_CLASS } from "src/consts";
import { useZip } from "src/contexts/zipContext";
import { useItemList } from "src/contexts/itemListContext";

import Item from "../Item/Item";
import ItemMore from "../ItemMore/ItemMore";

import "./FolderItem.scss";

function FolderItem(props: { item: ClientFolderJson }) {
  const { item } = props;

  const {
    handleSelect,
    handleRangeSelect,
    handleDelete,
    handleTrash,
    handleRestore,
  } = useItemList();

  const { downloadFolder } = useZip();

  const [moreOpen, setMoreOpen] = useState(false);
  const elIdentifier = "item-" + item.id;

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!e.ctrlKey && !e.shiftKey) return;

    if (e.ctrlKey) {
      handleSelect(item.id);
    } else if (e.shiftKey) {
      handleRangeSelect(item.id);
    } else {
      return;
    }

    e.preventDefault();
  };

  return (
    <Item className={elIdentifier} item={item}>
      <Link
        to={`/folder/${item.id}`}
        onClick={handleClick}
        className={`${ITEM_SELECT_CLASS} folder-item ${
          item.selected ? "folder-item--selected" : ""
        }`}
      >
        <span className="material-symbols-rounded">folder</span>
        <div>{item.title}</div>
        <div onClick={handleActionClick} className="folder-item__actions">
          <button onClick={() => setMoreOpen(true)}>
            <span className="material-symbols-rounded">more_horiz</span>
          </button>
        </div>
      </Link>
      <ItemMore
        identifier={elIdentifier}
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
      >
        <button
          onClick={() => {
            setMoreOpen(false);
            downloadFolder(item);
          }}
        >
          Download zip
        </button>
        {Boolean(item.trashed) && (
          <button onClick={() => handleRestore(item.id)}>Restore Folder</button>
        )}
        {Boolean(item.trashed) && (
          <button className="danger" onClick={() => handleDelete(item.id)}>
            Delete Permanently
          </button>
        )}
        {!item.trashed && (
          <button className="danger" onClick={() => handleTrash(item.id)}>
            Move to trash
          </button>
        )}
      </ItemMore>
    </Item>
  );
}

export default FolderItem;
