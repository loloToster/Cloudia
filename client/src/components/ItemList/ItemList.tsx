import { useState } from "react"
import { Item } from "@backend-types/types"

import "./ItemList.scss"

import QuickActions from "../QuickActions/QuickActions"
import FileItem from "../FileItem/FileItem"
import TextItem from "../TextItem/TextItem"
import UploadItem, { Upload } from "../UploadItem/UploadItem"

export type UploadContent = {
    isText: true,
    title?: string,
    text: string
} | {
    isText: false,
    files: FileList
}

interface Props {
    items: Item[],
    setItems: React.Dispatch<React.SetStateAction<Item[]>>,
    loading?: boolean,
    showQuickActions?: boolean
}

function ItemList(props: Props) {
    const { items, setItems, loading, showQuickActions = true } = props

    const [uploads, setUploads] = useState<Upload[]>([])

    const handleUpload = async (content: UploadContent) => {
        if (content.isText) {
            const res = await fetch("/api/text", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ ...content })
            })

            const newItems = await res.json()
            setItems(prevItems => newItems.concat(prevItems))
        } else {
            let data = new FormData()

            Array.from(content.files)
                .forEach(f => data.append("files", f))

            let upload: Upload = {
                numberOfFiles: content.files.length,
                progress: 0
            }

            setUploads(prev => [upload, ...prev])

            const req = new XMLHttpRequest()

            req.upload.addEventListener("progress", e => {
                upload.progress = e.loaded / e.total
                // force re-render
                setUploads(prev => [...prev])
            })

            req.onload = () => {
                setUploads(prev => (
                    [...prev.filter(u => u !== upload)]
                ))

                const newItems = req.status === 200 ? JSON.parse(req.responseText) : []
                setItems(prevItems => newItems.concat(prevItems))
            }

            req.open("post", "/api/file")
            req.send(data)
        }
    }

    const handleTrash = async (id: string) => {
        let res = await fetch(`/api/item/${id}/trash`, { method: "PATCH" })
        if (res.ok) setItems(items.filter(i => i.id !== id))
    }

    const handleDelete = async (id: string) => {
        let res = await fetch("/api/item/" + id, { method: "DELETE" })
        if (res.ok) setItems(items.filter(i => i.id !== id))
    }

    return (
        <div className="items">
            {loading && [...Array(5)].map((_, i) => (
                <div key={i} data-testid={"dummy-" + i} className="items__dummy"></div>
            ))}
            {!loading && showQuickActions && <QuickActions upload={handleUpload} />}
            {uploads.map((up, i) => (
                <UploadItem key={i} {...up} />
            ))}
            {!loading && items.map(item => {
                const onDelete = item.trashed ? handleDelete : handleTrash

                if (item.type === "text")
                    return <TextItem key={item.id} textItem={item} onDelete={onDelete} />
                else
                    return <FileItem key={item.id} fileItem={item} onDelete={onDelete} />
            })}
        </div>
    )
}

export default ItemList
