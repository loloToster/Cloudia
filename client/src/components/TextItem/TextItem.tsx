import { useRef, useState, ChangeEvent, useEffect } from "react";

import useDebounce from "src/hooks/useDebounce";
import useAfterMountEffect from "src/hooks/useAfterMountEffect";

import { ClientTextJson } from "@backend-types/types";
import { useItemList } from "src/contexts/itemListContext";

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
    <div
      className={`item item-${item.id} text-item ${
        item.selected ? "text-item--selected" : ""
      }`}
    >
      <div className="text-item__options">
        <div className="text-item__metadata">
          <div className="text-item__title">
            {Boolean(item.pinned) && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="16"
                viewBox="0 -960 960 960"
                width="16"
              >
                <path d="m624-480 96 96v72H516v228l-36 36-36-36v-228H240v-72l96-96v-264h-48v-72h384v72h-48v264Z" />
              </svg>
            )}
            <input type="text" value={title} onChange={handleTitleChange} />
          </div>
          <div className="text-item__user">{item.ip}</div>
        </div>
        {editing ? (
          <>
            <button onClick={handleEditCancel} title="Cancel Edit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 96 960 960"
                width="24"
              >
                <path d="m256 856-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </button>
            <button onClick={handleEditSave} title="Save Edit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 96 960 960"
                width="24"
              >
                <path d="M382 816 154 588l57-57 171 171 367-367 57 57-424 424Z" />
              </svg>
            </button>
          </>
        ) : (
          <>
            {item.trashed ? (
              <button onClick={onRestore} title="Restore Text">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                  <path d="M11 16h2v-4.15l1.6 1.55L16 12l-4-4-4 4 1.4 1.4 1.6-1.55Zm-4 5q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM7 6v13Z" />
                </svg>
              </button>
            ) : (
              <button onClick={handleCopy} ref={copyBtn} title="Copy Text">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                  <path d="M5 22q-.825 0-1.413-.587Q3 20.825 3 20V6h2v14h11v2Zm4-4q-.825 0-1.412-.587Q7 16.825 7 16V4q0-.825.588-1.413Q8.175 2 9 2h9q.825 0 1.413.587Q20 3.175 20 4v12q0 .825-.587 1.413Q18.825 18 18 18Zm0-2h9V4H9v12Zm0 0V4v12Z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                  <path d="m9.55 18.55-6.3-6.3 1.875-1.875L9.55 14.8l9.375-9.375L20.8 7.3Z" />
                </svg>
              </button>
            )}
            <button onClick={onSelect} title="Select Text">
              {item.selected ? (
                <svg
                  className="selected"
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                >
                  <path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                >
                  <path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
                </svg>
              )}
            </button>
            <button onClick={() => setMoreOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 -960 960 960"
                width="24"
              >
                <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
              </svg>
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
      <div className={`text-item__more ${moreOpen ? "active" : ""}`}>
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
        <div className="text-item__more__wrapper">
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
        </div>
      </div>
    </div>
  );
}

export default TextItem;
