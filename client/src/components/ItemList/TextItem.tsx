import { TextJson } from "@backend-types/types"

function TextItem(props: { textItem: TextJson, removeItem: Function }) {
    const { textItem } = props

    return (<div className="text-item">{textItem.text}</div>)
}

export default TextItem
