import { useEffect, useRef, useState } from "react"
import { ClientItem } from "@backend-types/types"

import { useSearch } from "src/contexts/searchContext"

import "./ItemList.scss"

import QuickActions from "../QuickActions/QuickActions"
import FileItem from "../FileItem/FileItem"
import TextItem from "../TextItem/TextItem"
import FolderItem from "../FolderItem/FolderItem"
import UploadItem, { Upload } from "../UploadItem/UploadItem"
import ActionBtn from "../ActionBtn/ActionBtn"

export type UploadContent = {
    isText: true,
    title?: string,
    text: string
} | {
    isText: false,
    files: FileList
}

interface Props {
    items: ClientItem[],
    setItems: React.Dispatch<React.SetStateAction<ClientItem[]>>,
    loading?: boolean,
    showQuickActions?: boolean
}

function ItemList(props: Props) {
    const { items, setItems, loading, showQuickActions = true } = props

    const [uploads, setUploads] = useState<Upload[]>([])
    const shiftSelectBorderItem = useRef<string | null>(null)

    useEffect(() => {
        const onWindowClick = (e: MouseEvent) => { // todo: remove magic string
            const clickOnItem = e.composedPath().some(el => (el as HTMLElement).classList?.contains("item"))

            if (clickOnItem) return

            setItems(prev => prev.map(i => ({ ...i, selected: false })))
            shiftSelectBorderItem.current = null
        }

        window.addEventListener("click", onWindowClick)
        return () => window.removeEventListener("click", onWindowClick)
    }, [setItems])

    const [folderModalOpen, setFolderModalOpen] = useState(false)
    const [folderName, setFolderName] = useState("")
    const [uploadContent, setUploadContent] = useState<UploadContent | null>(null)

    const handleUpload = async (content: UploadContent, folder?: string) => {
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

            if (typeof folder !== "undefined") data.append("folder", folder)

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

    const handleUploadAction = (content: UploadContent) => {
        if (content.isText || content.files.length <= 1)
            return handleUpload(content)

        setUploadContent(content)
        setFolderModalOpen(true)
    }

    const handleUploadAsFolder = async () => {
        if (!uploadContent) return

        await handleUpload(uploadContent, folderName)
        setUploadContent(null)
        setFolderModalOpen(false)
    }

    const handleUploadStandalone = async () => {
        if (!uploadContent) return

        await handleUpload(uploadContent)
        setUploadContent(null)
        setFolderModalOpen(false)

    }

    const handleCancelUpload = () => {
        setUploadContent(null)
        setFolderModalOpen(false)
    }

    const rmItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
    const rmItems = (ids: string[]) => setItems(prev => prev.filter(i => !ids.includes(i.id)))

    const selectItem = (id: string) => setItems(prev => prev.map(i => i.id === id ? ({ ...i, selected: !i.selected }) : i))

    const beforeSelect = () => {
        if (items.every(i => i.id !== shiftSelectBorderItem.current))
            shiftSelectBorderItem.current = null
    }

    const handleSelect = (id: string) => {
        beforeSelect()

        shiftSelectBorderItem.current = id
        selectItem(id)
    }

    const handleRangeSelect = (id: string) => {
        beforeSelect()

        if (!shiftSelectBorderItem.current) {
            shiftSelectBorderItem.current = id
            selectItem(id)
            return
        } else if (shiftSelectBorderItem.current === id) {
            setItems(prev => prev.map(i => ({ ...i, selected: i.id === id })))
            return
        }

        let inRange = false

        setItems(prev => prev.map(i => {
            let lastOrFirst = false

            if (i.id === shiftSelectBorderItem.current || i.id === id) {
                inRange = !inRange
                lastOrFirst = true
            }

            return { ...i, selected: inRange || lastOrFirst }
        }))
    }

    const handleItemRemoval = async (id: string, type: "restore" | "trash" | "delete") => {
        const hardDelete = type === "delete"
        const method = hardDelete ? "DELETE" : "PATCH"
        const apiPath = hardDelete ? "" : type

        if (items.find(i => i.id === id)?.selected) {
            const selectedIds = items.filter(i => i.selected).map(i => i.id)

            let res = await fetch(`/api/items/${apiPath}`, {
                method,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ ids: selectedIds })
            })

            if (res.ok) rmItems(selectedIds)
        } else {
            let res = await fetch(`/api/item/${id}/${apiPath}`, { method })
            if (res.ok) rmItem(id)
        }

    }

    const handleTrash = async (id: string) => {
        handleItemRemoval(id, "trash")
    }

    const handleRestore = async (id: string) => {
        handleItemRemoval(id, "restore")
    }

    const handleDelete = async (id: string) => {
        handleItemRemoval(id, "delete")
    }

    const { searchQuery } = useSearch()

    return (
        <div className="items">
            {loading && [...Array(5)].map((_, i) => (
                <div key={i} data-testid={"dummy-" + i} className="items__dummy"></div>
            ))}
            {!loading && showQuickActions && <QuickActions upload={handleUploadAction} />}
            {uploads.map((up, i) => (
                <UploadItem key={i} {...up} />
            ))}
            {!loading && items.filter(
                i => {
                    if (!searchQuery.length) return true

                    const sq = searchQuery.toLowerCase()

                    if (i.title.toLowerCase().includes(sq))
                        return true

                    if (i.type === "text" && i.text.toLowerCase().includes(sq))
                        return true

                    return false
                }).map(item => {
                    const itemProps = {
                        key: item.id,
                        onRestore: handleRestore,
                        onDelete: item.trashed ? handleDelete : handleTrash,
                        onSelect: handleSelect,
                        onRangeSelect: handleRangeSelect
                    }

                    if (item.type === "text")
                        return <TextItem textItem={item} {...itemProps} />
                    else if (item.type === "folder")
                        return <FolderItem folderItem={item} {...itemProps} />
                    else
                        return <FileItem fileItem={item} {...itemProps} />
                })}
            {folderModalOpen && (
                <div className="items__upload-modal">
                    <div className="items__upload-modal__wrapper">
                        <input
                            value={folderName}
                            onChange={e => setFolderName(e.target.value)}
                            type="text"
                            placeholder="Folder Name" />
                        <ActionBtn onClick={handleUploadAsFolder} text="Upload as Folder" className="items__upload-modal__btn" />
                        <div className="items__upload-modal__splitter">or</div>
                        <ActionBtn onClick={handleUploadStandalone} text="Upload Files" className="items__upload-modal__btn" />
                        <div className="items__upload-modal__splitter">or</div>
                        <ActionBtn onClick={handleCancelUpload} text="Cancel Upload" className="items__upload-modal__btn items__upload-modal__btn--cancel" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default ItemList
