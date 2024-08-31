import React, { useState } from "react"
import { Link } from "react-router-dom"

import "./FileItem.scss"

import { ClientFileJson } from "@backend-types/types"

function FileItem(props: {
    fileItem: ClientFileJson,
    onDelete: Function,
    onRestore: Function,
    onSelect: Function,
    onRangeSelect: Function
}) {
    const {
        fileItem,
        onDelete,
        onRestore,
        onSelect,
        onRangeSelect
    } = props

    const [moreOpen, setMoreOpen] = useState(false)

    const handleClick = (e: React.MouseEvent) => {
        if (!e.ctrlKey && !e.shiftKey) return

        if (e.ctrlKey) {
            onSelect(fileItem.id)
        } else if (e.shiftKey) {
            onRangeSelect(fileItem.id)
        } else {
            return
        }

        e.preventDefault()
    }

    const handleRestore = async (e: React.MouseEvent) => {
        e.preventDefault()
        onRestore(fileItem.id)
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        onDelete(fileItem.id)
    }

    const isImg = fileItem.type === "img"
    const icon = isImg ? `/cdn/${fileItem.id}` : `/icon/${fileItem.title}`

    return (
        <div className={`item file-item ${isImg ? "" : "file-item--with-icon"} ${fileItem.selected ? "file-item--selected" : ""}`}>
            <Link
                onClick={e => handleClick(e)}
                to={`/file/${fileItem.id}`}
                key={fileItem.id}>
                <img alt="icon" src={icon} className="file-item__icon" />
            </Link>
            <div className="file-item__options">
                <div className="file-item__metadata">
                    <div className="file-item__title">{fileItem.title}</div>
                    <div className="file-item__user">{fileItem.ip}</div>
                </div>
                {fileItem.trashed ? (
                    <>
                        <button onClick={handleRestore}
                            title="Restore File"
                            className="file-item__button file-item__button--download">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                <path d="M11 16h2v-4.15l1.6 1.55L16 12l-4-4-4 4 1.4 1.4 1.6-1.55Zm-4 5q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM7 6v13Z" />
                            </svg>
                        </button>
                        <button onClick={handleDelete}
                            title="Delete File"
                            className="file-item__button file-item__button--delete">
                            {fileItem.trashed ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                    <path d="m9.4 16.5 2.6-2.6 2.6 2.6 1.4-1.4-2.6-2.6L16 9.9l-1.4-1.4-2.6 2.6-2.6-2.6L8 9.9l2.6 2.6L8 15.1ZM7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM7 6v13Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                    <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2ZM7 6v13Z"></path>
                                </svg>
                            )}
                        </button>
                    </>
                ) : (
                    <button onClick={() => setMoreOpen(true)} className="file-item__button">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                            <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
                        </svg>
                    </button>
                )}
            </div>
            <div className={`file-item__more ${moreOpen ? "active" : ""}`}>
                <button onClick={() => setMoreOpen(false)} className="text-item__more__close">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg>
                </button>
                <div className="file-item__more__wrapper">
                    <a
                        href={`/cdn/${fileItem.id}`}
                        download={fileItem.title}>
                        Download File
                    </a>
                    {
                        Boolean(fileItem.trashed) && (
                            <button onClick={handleRestore}>
                                Restore Text
                            </button>
                        )
                    }
                    <button onClick={handleDelete} className="danger">
                        {fileItem.trashed ? (
                            "Delete Permanently"
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FileItem
