import { ClientItem } from "@backend-types/types";
import "./Item.scss";

export interface ItemProps {
  children?: React.ReactNode;
  item?: ClientItem;
  className?: string;
}

function Item(props: ItemProps) {
  return (
    <div className={`item ${props.className ?? ""}`}>{props.children}</div>
  );
}

export default Item;
