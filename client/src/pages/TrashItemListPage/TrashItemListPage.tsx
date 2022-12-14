import { useState, useEffect } from "react"

import { Item } from "@backend-types/types"
import ItemList from "src/components/ItemList/ItemList"

function ItemListPage() {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<Item[]>([])

    useEffect(() => {
        fetch("/api/items?trashed=true")
            .then(async data => {
                const json = await data.json()
                setItems(json)
            }).catch(err => {
                console.error(err)
            }).finally(() => {
                setLoading(false)
            })
    }, [])

    return (<ItemList loading={loading} items={items} setItems={setItems} showQuickActions={false} />)
}

export default ItemListPage
