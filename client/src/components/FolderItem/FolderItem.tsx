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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Z" />
      </svg>
      <div>{item.title}</div>
      <div className="folder-item__actions">
        {Boolean(item.trashed) && (
          <button onClick={onRestore} title="Restore Folder">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
              <path d="M11 16h2v-4.15l1.6 1.55L16 12l-4-4-4 4 1.4 1.4 1.6-1.55Zm-4 5q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM7 6v13Z" />
            </svg>
          </button>
        )}
        <button onClick={onDelete} title="Delete Folder">
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
      </div>
    </Link>
  );
}

export default FolderItem;
