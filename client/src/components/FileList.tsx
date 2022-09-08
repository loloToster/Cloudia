import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileJson } from "@backend-types/types"

function FileList() {
    const navigate = useNavigate()

    const [files, setFiles] = useState<FileJson[]>([])
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

    const handleQuickUpload = () => {
        const input = document.createElement("input")
        input.type = "file"
        input.setAttribute("multiple", "")
        input.click()

        input.addEventListener("change", async () => {
            const files = input.files
            input.remove()

            if (!files) return

            let data = new FormData()

            Array.from(files)
                .forEach(f => data.append("files", f))

            const res = await fetch("/api/file", {
                method: "POST",
                body: data
            })

            setFiles(await res.json())
        })
    }

    const [savingQuickText, setSavingQuickText] = useState(false)

    const firstActionBtn = useRef<HTMLButtonElement>(null)
    const secondActionBtn = useRef<HTMLButtonElement>(null)
    const textarea = useRef<HTMLTextAreaElement>(null)

    const handleQuickTextOpen = () => {
        firstActionBtn.current?.classList.add("hidden")
        secondActionBtn.current?.classList.add("active")
        textarea.current?.focus()
    }

    const handleQuickTextClose = (e?: React.MouseEvent) => {
        firstActionBtn.current?.classList.remove("hidden")
        secondActionBtn.current?.classList.remove("active")
        if (textarea.current) textarea.current.value = ""
        e?.stopPropagation()
    }

    const handleQuickTextSave = async () => {
        if (savingQuickText || !textarea.current) return

        setSavingQuickText(true)

        const text = textarea.current.value

        try {
            const res = await fetch("/api/text", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ text })
            })

            setFiles(await res.json())

            handleQuickTextClose()
        } catch (err) {
            console.error(err)
        } finally {
            setSavingQuickText(false)
        }
    }

    return (
        <div className="files">
            {loading && [...Array(5)].map((_, i) => (
                <div key={i} className="files__dummy"></div>
            ))}
            {!loading && (
                <div className="files__quick-actions">
                    <button ref={firstActionBtn} onClick={handleQuickUpload} className="files__quick-action">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                            <path d="M11 40q-1.2 0-2.1-.9Q8 38.2 8 37v-7.15h3V37h26v-7.15h3V37q0 1.2-.9 2.1-.9.9-2.1.9Zm11.5-7.65V13.8l-6 6-2.15-2.15L24 8l9.65 9.65-2.15 2.15-6-6v18.55Z" />
                        </svg>
                    </button>
                    <button ref={secondActionBtn} onClick={handleQuickTextOpen} className="files__quick-action">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                            <path d="M24 42v-3.55l10.8-10.8 3.55 3.55L27.55 42ZM6 31.5v-3h15v3Zm34.5-2.45-3.55-3.55 1.45-1.45q.4-.4 1.05-.4t1.05.4l1.45 1.45q.4.4.4 1.05t-.4 1.05ZM6 23.25v-3h23.5v3ZM6 15v-3h23.5v3Z" />
                        </svg>
                        <div className="files__quick-action__textarea-wrapper">
                            <textarea ref={textarea} placeholder="Type in your text here..."></textarea>
                            <div>
                                <div onClick={handleQuickTextClose} className="action-btn">Cancel</div>
                                <div onClick={handleQuickTextSave} className={`action-btn ${savingQuickText ? "loading" : ""}`}>
                                    <div className="action-btn__content">
                                        Save
                                    </div>
                                    <div className="action-btn__loading">
                                        Saving
                                        <span className="action-btn__loading-item">.</span>
                                        <span className="action-btn__loading-item">.</span>
                                        <span className="action-btn__loading-item">.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            )}
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
        </div>
    )
}

export default FileList
