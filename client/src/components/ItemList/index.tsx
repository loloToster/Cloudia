import { useEffect, useState } from "react"
import { Item } from "@backend-types/types"

import QuickActions from "./QuickActions"
import FileItem from "./FileItem"
import TextItem from "./TextItem"

export type UploadContent = {
    isText: true,
    title?: string,
    text: string
} | {
    isText: false,
    files: FileList
}

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

    const handleUpload = async (content: UploadContent) => {
        let res: Response

        if (content.isText) {
            res = await fetch("/api/text", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ ...content })
            })
        } else {
            let data = new FormData()

            Array.from(content.files)
                .forEach(f => data.append("files", f))

            res = await fetch("/api/file", {
                method: "POST",
                body: data
            })
        }

        const newItems = await res.json()

        setItems(prevItems => newItems.concat(prevItems))
    }

    const handleDelete = async (id: string) => {
        let res = await fetch("/api/item/" + id, { method: "DELETE" })
        if (res.ok) setItems(items.filter(i => i.id !== id))
    }

    return (
        <div className="items">
            {loading && [...Array(5)].map((_, i) => (
                <div key={i} className="items__dummy"></div>
            ))}
            {!loading && <QuickActions upload={handleUpload} />}
            {!loading && items.map(item => {
                if (item.is_file)
                    return <FileItem key={item.id} fileItem={item} onDelete={handleDelete} />
                else
                    return <TextItem key={item.id} textItem={item} onDelete={handleDelete} />
            })}
        </div>
    )
}

export default ItemList
