import { useEffect } from "react"

import { useItemsCache } from "src/contexts/itemsCacheContext"
import ItemList from "src/components/ItemList/ItemList"

function ItemListPage() {
    const {
        trashedItems,
        loadingTrashedItems,
        setLoadingTrashedItems,
        setTrashedItems
    } = useItemsCache()

    useEffect(() => {
        fetch("/api/items?trashed=true")
            .then(async data => {
                const json = await data.json()
                setTrashedItems(json)
            }).catch(err => {
                console.error(err)
            }).finally(() => {
                setLoadingTrashedItems(false)
            })
    }, [])

    return (<ItemList loading={loadingTrashedItems} items={trashedItems} setItems={setTrashedItems} showQuickActions={false} />)
}

export default ItemListPage
