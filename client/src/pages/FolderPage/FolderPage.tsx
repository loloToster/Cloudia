import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { ClientItem } from "@backend-types/types"

import ItemList from "src/components/ItemList/ItemList"

function FolderPage() {
  const { id } = useParams()

  const [items, setItems] = useState<ClientItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)

  useEffect(() => {
    fetch("/api/folder/" + id)
      .then(async data => {
        const json = await data.json()
        setItems(json.map((i: any) => ({ ...i, selected: false })))
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        setLoadingItems(false)
      })
  }, [])

  return (<ItemList loading={loadingItems} items={items} setItems={setItems} showQuickActions={false} />)
}

export default FolderPage
