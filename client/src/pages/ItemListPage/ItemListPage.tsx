import { useEffect } from "react"

import { useItemsCache } from "src/contexts/itemsCacheContext"
import ItemList from "src/components/ItemList/ItemList"

function ItemListPage() {
    const { items, setItems, loadingItems, setLoadingItems } = useItemsCache()

    useEffect(() => {
        fetch("/api/items")
            .then(async data => {
                const json = await data.json()
                setItems(json.map((i: any) => ({ ...i, selected: false })))
            }).catch(err => {
                console.error(err)
            }).finally(() => {
                setLoadingItems(false)
            })
    }, [])

    return (<ItemList loading={loadingItems} items={items} setItems={setItems} />)
}

export default ItemListPage
