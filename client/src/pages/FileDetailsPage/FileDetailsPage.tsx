import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FileJson } from "@backend-types/types"

import "./FileDetailsPage.scss"

import ActionBtn from "src/components/ActionBtn/ActionBtn"

function FileDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    
    const [file, setFile] = useState<FileJson | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetch("/api/item/" + id)
            .then(async res => {
                const json = await res.json()
                setFile(json)
            })
    }, [id])

    if (!file) return (
        <div className="loader"></div>
    )

    const handleDelete = () => {
        setDeleting(true)

        const path = file.trashed ? 
            `/api/item/${file.id}` :
            `/api/item/${file.id}/trash`

        const method = file.trashed ? "DELETE" : "PATCH"

        const navigateTo = file.trashed ? "/trash" : "/"

        fetch(path, { method })
            .then(res => {
                if (res.ok) navigate(navigateTo)
            }).finally(() => {
                setDeleting(false)
            })
    }

    const isImg = file.type === "img"
    const icon = isImg ? `/cdn/${file.id}` : `/icon/${file.title}`

    return (
        <div className="file-details">
            <div className="file-details__col">
                <div className="file-details__img-wrapper">
                    <img alt="preview" src={icon} className={`file-details__img ${isImg ? "" : "file-details__img--icon"}`} />
                </div>
            </div>
            <div className="file-details__col">
                <div className="file-details__title">{file.title}</div>
                <div className="file-details__user">{file.ip}</div>
                <div className="file-details__btns">
                    <ActionBtn text="Download"
                        onClick={`/cdn/${file.id}`}
                        download={file.id}
                        className="file-details__btn--download" />
                    <ActionBtn text="Open in new tab"
                        onClick={`/cdn/${file.id}`}
                        newPage
                        className="file-details__btn--open" />
                    <ActionBtn text={file.trashed ? "Delete permamently" : "Move to trash"}
                        textLoading={file.trashed ? "Deleting" : "Moving to trash"}
                        onClick={handleDelete}
                        loading={deleting}
                        className="file-details__btn--delete" />
                </div>
            </div>
        </div>
    )
}

export default FileDetails
