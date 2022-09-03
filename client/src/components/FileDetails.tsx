import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FileJson } from "@backend-types/types"

function FileDetails() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [file, setFile] = useState<FileJson | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetch("/api/file/" + id)
            .then(async res => {
                const json = await res.json()
                setFile(json)
            })
    }, [id])

    const handleDelete = (id?: string) => {
        if (!id) return

        setDeleting(true)

        fetch("/api/file/" + id, { method: "DELETE" })
            .then(res => {
                if (res.ok) navigate("/")
            }).finally(() => {
                setDeleting(false)
            })
    }

    if (!file) return (
        <div className="loader"></div>
    )

    const icon = file.icon ? `/icons/${file.icon}.png` : `/cdn/${file.id}`

    return (
        <div className="file-details">
            <div className="file-details__col">
                <div className="file-details__img-wrapper">
                    <div style={{ "--src": `url("${icon}")` } as React.CSSProperties}
                        className={`file-details__img ${file.icon ? "file-details__img--icon" : ""}`}></div>
                </div>
            </div>
            <div className="file-details__col">
                <div className="file-details__title">{file.title}</div>
                <div className="file-details__user">{file.ip}</div>
                <div className="file-details__btns">
                    <a href={`/cdn/${id}`}
                        download={id}
                        className="file-details__btn file-details__btn--download action-btn">
                        Download
                    </a>
                    <a href={`/cdn/${id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="file-details__btn file-details__btn--open action-btn">
                        Open in new tab
                    </a>
                    <button onClick={() => handleDelete(id)}
                        className={`${deleting ? "loading" : ""} file-details__btn file-details__btn--delete action-btn`}>
                        <div className="action-btn__content">Delete</div>
                        <div className="action-btn__loading">
                            Deleting
                            <span className="action-btn__loading-item">.</span>
                            <span className="action-btn__loading-item">.</span>
                            <span className="action-btn__loading-item">.</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FileDetails
