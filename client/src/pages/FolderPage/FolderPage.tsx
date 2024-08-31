import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { ClientItem, FolderJson } from "@backend-types/types"

import ItemList from "src/components/ItemList/ItemList"

function FolderPage() {
  const { id } = useParams()

  const [items, setItems] = useState<ClientItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [folderPath, setFolderPath] = useState<FolderJson[]>([])
  const [loadingFolderPath, setLoadingFolderPath] = useState(true)

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
  }, [id])

  useEffect(() => {
    fetch("/api/folderpath/" + id)
      .then(async data => {
        const json = await data.json()
        setFolderPath(json)
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        setLoadingFolderPath(false)
      })
  }, [id])

  return (<ItemList
    loading={loadingItems}
    items={items}
    setItems={setItems}
    folderId={id}
    loadingFolderPath={loadingFolderPath}
    folderPath={folderPath} />)
}

export default FolderPage
