import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export interface File {
    id: string,
    title: string,
    ip: string
    icon: string | null
}

function FileList() {
    const navigate = useNavigate()

    const [files, setFiles] = useState<File[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/files")
            .then(async data => {
                const json = await data.json()
                setFiles(json)
            }).catch(err => {
                console.error(err)
            }).finally(() => {
                setLoading(false)
            })
    }, [])

    const handleFileClick = (id: string) => {
        navigate("/file/" + id)
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        let res = await fetch("/api/file/" + id, { method: "DELETE" })
        if (res.ok) setFiles(files.filter(file => file.id !== id))
    }

    return (
        <div className="files">
            {loading && [...Array(5)].map((_, i) => (
                <div key={i} className="files__dummy"></div>
            ))}
            {!loading && files.map(file => {
                const icon = file.icon ? `/icons/${file.icon}.png` : `/cdn/${file.id}`

                return (
                    <div onClick={() => handleFileClick(file.id)}
                        style={{ "--src": `url("${icon}")` } as React.CSSProperties}
                        className={`files__file ${file.icon ? "files__file--with-icon" : ""}`}
                        key={file.id}>
                        <div className="files__options">
                            <div className="files__metadata">
                                <div className="files__title">{file.title}</div>
                                <div className="files__user">{file.ip}</div>
                            </div>
                            <a onClick={e => e.stopPropagation()} href={`/cdn/${file.id}`} download={file.id} className="files__button files__button--download">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                    <path d="M6 20q-.825 0-1.412-.587Q4 18.825 4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413Q18.825 20 18 20Zm6-4-5-5 1.4-1.45 2.6 2.6V4h2v8.15l2.6-2.6L17 11Z" />
                                </svg>
                            </a>
                            <button onClick={e => handleDelete(e, file.id)} className="files__button files__button--delete">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                    <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2ZM7 6v13Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )
            })}
            {!loading && (
                <div onClick={() => navigate("/add")} className="files__add">
                    <div className="files__add__plus"></div>
                </div>
            )}
        </div>
    )
}

export default FileList
