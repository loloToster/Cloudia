import { TextJson } from "@backend-types/types"

function TextItem(props: { textItem: TextJson, removeItem: Function }) {
    const { textItem } = props

    return (<>{textItem.text}</>)
}

export default TextItem
