import React, { useEffect, useRef, useState } from "react";
import { FileDrop } from "react-file-drop";

import "./QuickActions.scss";

import { UploadContent } from "../ItemList/ItemList";
import ActionBtn from "src/components/ActionBtn/ActionBtn";
import Item from "../Item/Item";

type uploadFunc = (c: UploadContent) => void;

function QuickActions(props: { upload: uploadFunc }) {
  const { upload } = props;

  const [dropActive, setDropActive] = useState(false);

  useEffect(() => {
    let lastTarget: null | EventTarget = null;

    window.ondragenter = (e) => {
      lastTarget = e.target;
      setDropActive(true);
    };

    window.ondragleave = (e) => {
      if (e.target !== lastTarget && e.target !== document) return;

      setDropActive(false);
    };

    window.ondrop = () => setDropActive(false);

    document.onpaste = (e) => {
      if (!e.clipboardData) return;

      if (
        !e.composedPath().every((el) => {
          const tag = (el as Partial<HTMLElement>).tagName?.toLocaleLowerCase();
          return tag !== "input" && tag !== "textarea";
        })
      )
        return;

      const { files } = e.clipboardData;

      if (files.length) upload({ isText: false, files });
      else upload({ isText: true, text: e.clipboardData.getData("text") });
    };

    return () => {
      lastTarget = null;
      window.ondragenter = null;
      window.ondragleave = null;
      window.ondrop = null;
      document.onpaste = null;
    };
  });

  const handleFileDrop = (files: FileList | null) => {
    if (files) upload({ isText: false, files });
  };

  const handleQuickUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.setAttribute("multiple", "");
    input.click();

    input.addEventListener("change", async () => {
      const files = input.files;
      input.remove();

      if (!files) return;

      upload({ isText: false, files });
    });
  };

  const firstActionBtn = useRef<HTMLButtonElement>(null);
  const secondActionBtn = useRef<HTMLDivElement>(null);

  const [savingQuickText, setSavingQuickText] = useState(false);
  const [title, setTitle] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);

  const handleQuickTextOpen = () => {
    if (secondActionBtn.current?.classList.contains("active")) return;

    firstActionBtn.current?.classList.add("hidden");
    secondActionBtn.current?.classList.add("active");
    textarea.current?.focus();
  };

  const handleQuickTextClose = (e?: React.MouseEvent) => {
    firstActionBtn.current?.classList.remove("hidden");
    secondActionBtn.current?.classList.remove("active");
    if (textarea.current) textarea.current.value = "";
    e?.stopPropagation();
  };

  const handleQuickTextSave = async () => {
    if (savingQuickText || !textarea.current) return;

    setSavingQuickText(true);

    const text = textarea.current.value;

    try {
      await upload({ isText: true, title, text });
      handleQuickTextClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingQuickText(false);
    }
  };

  return (
    <Item className="quick-actions">
      <FileDrop
        onDrop={handleFileDrop}
        className={`quick-actions__drop-area ${dropActive ? "active" : ""}`}
      >
        <div className="quick-actions__drop-area__content">
          <span className="material-symbols-rounded">upload</span>
          <h1>Upload files</h1>
        </div>
      </FileDrop>
      <button
        ref={firstActionBtn}
        onClick={handleQuickUpload}
        title="Upload Files"
        className="quick-actions__action"
      >
        <span className="material-symbols-rounded">upload</span>
      </button>
      <div
        role="button"
        ref={secondActionBtn}
        onClick={handleQuickTextOpen}
        title="Add Text"
        className="quick-actions__action"
      >
        <span className="material-symbols-rounded">edit_note</span>
        <div className="quick-actions__action__textarea-wrapper">
          <input
            onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
            value={title}
            placeholder="Title"
            type="text"
          />
          <textarea
            ref={textarea}
            placeholder="Type in your text here..."
          ></textarea>
          <div>
            <ActionBtn text="Cancel" onClick={handleQuickTextClose} />
            <ActionBtn
              text="Save"
              textLoading="Saving"
              onClick={handleQuickTextSave}
              loading={savingQuickText}
            />
          </div>
        </div>
      </div>
    </Item>
  );
}

export default QuickActions;
