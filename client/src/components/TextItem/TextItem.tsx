import { useRef, useState, ChangeEvent } from "react";

import useDebounce from "src/hooks/useDebounce";
import useAfterMountEffect from "src/hooks/useAfterMountEffect";

import { ClientTextJson } from "@backend-types/types";
import { ITEM_SELECT_CLASS } from "src/consts";
import { useItemList } from "src/contexts/itemListContext";

import Item from "../Item/Item";
import ItemMore from "../ItemMore/ItemMore";

import "./TextItem.scss";

// https://stackoverflow.com/questions/71873824/copy-text-to-clipboard-cannot-read-properties-of-undefined-reading-writetext
async function copyToClipboard(text: string) {
  try {
    await window.navigator.clipboard.writeText(text);
  } catch {
    console.warn("could not copy with clipboard.writeText");

    const textArea = document.createElement("textarea");

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Unable to copy to clipboard", err);
    }

    document.body.removeChild(textArea);
  }
}

// https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
function urlify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  text = escapeHtml(text);

  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
}

function TextItem(props: { item: ClientTextJson }) {
  const { item } = props;

  const {
    handleDelete,
    handleTrash,
    handleRestore,
    handleSelect,
    handleRangeSelect,
    handlePin,
    handleUnpin,
  } = useItemList();

  const [moreOpen, setMoreOpen] = useState(false);
  const [text, setText] = useState(item.text);
  const [title, setTitle] = useState(item.title || "No Title");

  const elIdentifier = "item-" + item.id;

  const debouncedTitle = useDebounce(title);

  useAfterMountEffect(() => {
    fetch(`/api/item/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        field: "title",
        value: debouncedTitle,
      }),
    });
  }, [debouncedTitle]);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const [editing, setEditing] = useState(false);
  const [textareaVal, setTextareaVal] = useState(item.text);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const handleEditStart = () => {
    setEditing(true);
    setMoreOpen(false);

    setTimeout(() => {
      if (!textarea.current) return;

      textarea.current.focus();
      textarea.current.selectionStart = textarea.current.selectionEnd =
        textarea.current.value.length;
      textarea.current.scrollTo({ top: textarea.current.scrollHeight });
    });
  };

  const handleEditCancel = () => {
    setEditing(false);
    setTextareaVal(text);
  };

  const handleEditSave = async () => {
    setText(textareaVal);
    setEditing(false);

    fetch(`/api/item/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        field: "text",
        value: textareaVal,
      }),
    });
  };

  const onPin = () => {
    handlePin(item.id);
    setMoreOpen(false);
  };

  const onUnpin = () => {
    handleUnpin(item.id);
    setMoreOpen(false);
  };

  const onRestore = () => {
    handleRestore(item.id);
    setEditing(false);
  };

  const onDelete = () => {
    item.trashed ? handleDelete(item.id) : handleTrash(item.id);

    setEditing(false);
  };

  const copyBtn = useRef<HTMLButtonElement>(null);
  let copyTimeout: any;
  const handleCopy = () => {
    const button = copyBtn.current;
    if (!button) return;

    setMoreOpen(false);

    clearTimeout(copyTimeout);
    copyToClipboard(text);
    button.classList.remove("success");
    // restarts color animation
    void button.querySelector("svg:nth-child(2)")?.scrollHeight;
    button.classList.add("success");

    copyTimeout = setTimeout(() => {
      button.classList.remove("success");
    }, 3000);
  };

  const onSelect = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      handleRangeSelect(item.id);
    } else {
      handleSelect(item.id);
    }
  };

  return (
    <Item
      item={item}
      className={`${ITEM_SELECT_CLASS} item-${item.id} text-item ${
        item.selected ? "text-item--selected" : ""
      }`}
    >
      <div className="text-item__options">
        <div className="text-item__metadata">
          <div className="text-item__title">
            {Boolean(item.pinned) && (
              <span className="material-symbols-rounded">keep</span>
            )}
            <input type="text" value={title} onChange={handleTitleChange} />
          </div>
          <div className="text-item__user">{item.ip}</div>
        </div>
        {editing ? (
          <>
            <button onClick={handleEditCancel} title="Cancel Edit">
              <span className="material-symbols-rounded">close</span>
            </button>
            <button onClick={handleEditSave} title="Save Edit">
              <span className="material-symbols-rounded">check</span>
            </button>
          </>
        ) : (
          <>
            {item.trashed ? (
              <button onClick={onRestore} title="Restore Text">
                <span className="material-symbols-rounded">
                  restore_from_trash
                </span>
              </button>
            ) : (
              <button onClick={handleCopy} ref={copyBtn} title="Copy Text">
                <span className="material-symbols-rounded">content_copy</span>
                <span className="material-symbols-rounded">check</span>
              </button>
            )}
            <button onClick={onSelect} title="Select Text">
              {item.selected ? (
                <span className="material-symbols-rounded selected">
                  check_box
                </span>
              ) : (
                <span className="material-symbols-rounded">
                  check_box_outline_blank
                </span>
              )}
            </button>
            <button onClick={() => setMoreOpen(true)}>
              <span className="material-symbols-rounded">more_horiz</span>
            </button>
          </>
        )}
      </div>
      <div className="text-item__text">
        {editing ? (
          <textarea
            ref={textarea}
            value={textareaVal}
            onChange={(e) =>
              setTextareaVal((e.target as HTMLTextAreaElement).value)
            }
            placeholder="Type in your text here..."
          ></textarea>
        ) : (
          <pre dangerouslySetInnerHTML={{ __html: urlify(text) }}></pre>
        )}
      </div>
      <ItemMore
        identifier={elIdentifier}
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
      >
        <button onClick={handleEditStart}>Edit Text</button>
        {item.pinned ? (
          <button onClick={onUnpin}>Unpin</button>
        ) : (
          <button onClick={onPin}>Pin</button>
        )}
        <button onClick={handleCopy}>Copy</button>
        {Boolean(item.trashed) && (
          <button onClick={onRestore}>Restore Text</button>
        )}
        <button onClick={onDelete} className="danger">
          {item.trashed ? "Delete Permanently" : "Move to trash"}
        </button>
      </ItemMore>
    </Item>
  );
}

export default TextItem;
