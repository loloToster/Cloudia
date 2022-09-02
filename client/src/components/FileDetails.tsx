import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function FileDetails() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [img, setImg] = useState("")
    const [file, setFile] = useState("")
    const [title, setTitle] = useState("---")
    const [user, setUser] = useState("---")

    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetch("/api/file/" + id)
            .then(async res => {
                const json = await res.json()

                setImg(`url("/cdn/${json.file}")`)
                setFile(json.file)
                setTitle(json.title)
                setUser(json.user)
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

    return (
        <div className="file-details">
            <div className="file-details__col">
                <div className="file-details__img-wrapper">
                    <div style={{ "--src": img } as React.CSSProperties} className="file-details__img"></div>
                </div>
            </div>
            <div className="file-details__col">
                <div className="file-details__title">{title}</div>
                <div className="file-details__user">{user}</div>
                <div className="file-details__btns">
                    <a href={`/cdn/${file}`} download={file} className="file-details__btn file-details__btn--download action-btn">Download</a>
                    <button onClick={() => handleDelete(id)} className={`${deleting ? "loading" : ""} file-details__btn file-details__btn--delete action-btn`}>
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
