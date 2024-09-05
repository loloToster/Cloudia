import React, { useEffect } from "react";
import "./ItemMore.scss";

export interface ItemMoreProps {
  open: boolean;
  onClose: () => void;
  identifier: string;
  children?: React.ReactNode;
}

function ItemMore(props: ItemMoreProps) {
  const { onClose, identifier } = props;

  useEffect(() => {
    const onWindowClick = (e: MouseEvent) => {
      const clickOnItem = e
        .composedPath()
        .some((el) => (el as HTMLElement).classList?.contains(identifier));

      if (clickOnItem) return;

      onClose();
    };

    document.body.addEventListener("click", onWindowClick);
    return () => document.body.removeEventListener("click", onWindowClick);
  }, [onClose, identifier]);

  return (
    <div className={`item-more ${props.open ? "active" : ""}`}>
      <button onClick={props.onClose} className="item-more__close">
        <span className="material-symbols-rounded">close</span>
      </button>
      <div className="item-more__wrapper">{props.children}</div>
    </div>
  );
}

export default ItemMore;
