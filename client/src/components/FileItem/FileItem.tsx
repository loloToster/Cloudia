import React from "react"
import { useNavigate } from "react-router-dom"

import "./FileItem.scss"

import { FileJson } from "@backend-types/types"

function FileItem(props: { fileItem: FileJson, onDelete: Function }) {
    const navigate = useNavigate()

    const { fileItem, onDelete } = props

    const handleFileClick = (id: string) => {
        navigate("/file/" + id)
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        onDelete(id)
    }

    const isImg = fileItem.type === "img"
    const icon = isImg ? `/cdn/${fileItem.id}` : `/icon/${fileItem.title}`

    return (
        <div onClick={() => handleFileClick(fileItem.id)}
            className={`file-item ${isImg ? "" : "file-item--with-icon"}`}
            key={fileItem.id}>
            <img alt="icon" src={icon} className="file-item__icon" />
            <div className="file-item__options">
                <div className="file-item__metadata">
                    <div className="file-item__title">{fileItem.title}</div>
                    <div className="file-item__user">{fileItem.ip}</div>
                </div>
                <a onClick={e => e.stopPropagation()}
                    title="Download File"
                    href={`/cdn/${fileItem.id}`}
                    download={fileItem.id}
                    className="file-item__button file-item__button--download">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path d="M6 20q-.825 0-1.412-.587Q4 18.825 4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413Q18.825 20 18 20Zm6-4-5-5 1.4-1.45 2.6 2.6V4h2v8.15l2.6-2.6L17 11Z" />
                    </svg>
                </a>
                <button onClick={e => handleDelete(e, fileItem.id)}
                    title="Delete File"
                    className="file-item__button file-item__button--delete">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2ZM7 6v13Z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default FileItem
