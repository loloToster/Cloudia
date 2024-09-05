import { ClientItem } from "@backend-types/types";
import "./Item.scss";

export interface ItemProps {
  children?: React.ReactNode;
  item?: ClientItem;
  className?: string;
}

function ItemStatus({ className, text }: { className: string; text: string }) {
  return (
    <div className={`item__status item__status--${className}`}>
      <div className="loader"></div>
      <div>{text}</div>
    </div>
  );
}

function Item(props: ItemProps) {
  return (
    <div className={`item ${props.className ?? ""}`}>
      {props.children}
      {props.item?.deleting && (
        <ItemStatus className="deleting" text="Deleting" />
      )}
      {props.item?.restoring && (
        <ItemStatus className="restoring" text="Restoring" />
      )}
      {props.item?.unpinning && (
        <ItemStatus className="unpinning" text="Unpinning" />
      )}
      {props.item?.pinning && <ItemStatus className="pinning" text="Pinning" />}
    </div>
  );
}

export default Item;
