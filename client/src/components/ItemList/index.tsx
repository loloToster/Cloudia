import { useEffect, useState } from "react"
import { Item } from "@backend-types/types"

import QuickActions from "./QuickActions"
import FileItem from "./FileItem"
import TextItem from "./TextItem"

function ItemList() {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/items")
            .then(async data => {
                const json = await data.json()
                setItems(json)
            }).catch(err => {
                console.error(err)
            }).finally(() => {
                setLoading(false)
            })
    }, [])

    const addItems = (itms: Item[]) => {
        setItems(prevItems => itms.concat(prevItems))
    }

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id))
    }

    return (
        <div className="items">
            {loading && [...Array(5)].map((_, i) => (
                <div key={i} className="items__dummy"></div>
            ))}
            {!loading && <QuickActions addItems={addItems} />}
            {!loading && items.map(item => {
                if (item.is_file)
                    return <FileItem key={item.id} fileItem={item} removeItem={removeItem} />
                else
                    return <TextItem key={item.id} textItem={item} removeItem={removeItem} />
            })}
        </div>
    )
}

export default ItemList
