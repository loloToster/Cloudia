import { Link } from "react-router-dom";
import { ClientFolderJson } from "@backend-types/types";
import { useItemList } from "src/contexts/itemListContext";

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

  const onRestore = (e: React.MouseEvent) => {
    e.preventDefault();
    handleRestore(item.id);
  };

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault();

    item.trashed ? handleDelete(item.id) : handleTrash(item.id);
  };

  return (
    <Link
      to={`/folder/${item.id}`}
      onClick={handleClick}
      className={`item folder-item ${
        item.selected ? "folder-item--selected" : ""
      }`}
    >
      <span className="material-symbols-rounded">folder</span>
      <div>{item.title}</div>
      <div className="folder-item__actions">
        {Boolean(item.trashed) && (
          <button onClick={onRestore} title="Restore Folder">
            <span className="material-symbols-rounded">restore_from_trash</span>
          </button>
        )}
        <button onClick={onDelete} title="Delete Folder">
          {item.trashed ? (
            <span className="material-symbols-rounded">delete_forever</span>
          ) : (
            <span className="material-symbols-rounded">delete</span>
          )}
        </button>
      </div>
    </Link>
  );
}

export default FolderItem;
