import React, { useEffect, useRef, useState } from "react"
import { FileDrop } from "react-file-drop"

import "./QuickActions.scss"

import { UploadContent } from "../ItemList/ItemList"
import ActionBtn from "src/components/ActionBtn/ActionBtn"

type uploadFunc = (c: UploadContent) => void

function QuickActions(props: { upload: uploadFunc }) {
    const { upload } = props

    const [dropActive, setDropActive] = useState(false)

    useEffect(() => {
        let lastTarget: null | EventTarget = null

        window.ondragenter = (e) => {
            lastTarget = e.target
            setDropActive(true)
        }

        window.ondragleave = (e) => {
            if (e.target !== lastTarget && e.target !== document)
                return

            setDropActive(false)
        }

        window.ondrop = () => setDropActive(false)

        document.onpaste = e => {
            if (!e.clipboardData) return

            if (!e.composedPath().every(
                el => {
                    const tag = (el as Partial<HTMLElement>).tagName?.toLocaleLowerCase()
                    return tag !== "input" && tag !== "textarea"
                })
            )
                return

            const { files } = e.clipboardData

            if (files.length)
                upload({ isText: false, files })
            else
                upload({ isText: true, text: e.clipboardData.getData("text") })
        }

        return () => {
            lastTarget = null
            window.ondragenter = null
            window.ondragleave = null
            window.ondrop = null
            document.onpaste = null
        }
    })

    const handleFileDrop = (files: FileList | null) => {
        if (files) upload({ isText: false, files })
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

            upload({ isText: false, files })
        })
    }

    const firstActionBtn = useRef<HTMLButtonElement>(null)
    const secondActionBtn = useRef<HTMLDivElement>(null)

    const [savingQuickText, setSavingQuickText] = useState(false)
    const [title, setTitle] = useState("")
    const textarea = useRef<HTMLTextAreaElement>(null)

    const handleQuickTextOpen = () => {
        if (secondActionBtn.current?.classList.contains("active"))
            return

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
            await upload({ isText: true, title, text })
            handleQuickTextClose()
        } catch (err) {
            console.error(err)
        } finally {
            setSavingQuickText(false)
        }
    }

    return (<div className="quick-actions">
        <FileDrop onDrop={handleFileDrop} className={`quick-actions__drop-area ${dropActive ? "active" : ""}`}>
            <div className="quick-actions__drop-area__content">
                <svg className="" xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                    <path d="M11 40q-1.2 0-2.1-.9Q8 38.2 8 37v-7.15h3V37h26v-7.15h3V37q0 1.2-.9 2.1-.9.9-2.1.9Zm11.5-7.65V13.8l-6 6-2.15-2.15L24 8l9.65 9.65-2.15 2.15-6-6v18.55Z" />
                </svg>
                <h1>Upload files</h1>
            </div>
        </FileDrop>
        <button ref={firstActionBtn}
            onClick={handleQuickUpload}
            title="Upload Files"
            className="quick-actions__action">
            <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                <path d="M11 40q-1.2 0-2.1-.9Q8 38.2 8 37v-7.15h3V37h26v-7.15h3V37q0 1.2-.9 2.1-.9.9-2.1.9Zm11.5-7.65V13.8l-6 6-2.15-2.15L24 8l9.65 9.65-2.15 2.15-6-6v18.55Z" />
            </svg>
        </button>
        <div role="button"
            ref={secondActionBtn}
            onClick={handleQuickTextOpen}
            title="Add Text"
            className="quick-actions__action">
            <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                <path d="M24 42v-3.55l10.8-10.8 3.55 3.55L27.55 42ZM6 31.5v-3h15v3Zm34.5-2.45-3.55-3.55 1.45-1.45q.4-.4 1.05-.4t1.05.4l1.45 1.45q.4.4.4 1.05t-.4 1.05ZM6 23.25v-3h23.5v3ZM6 15v-3h23.5v3Z" />
            </svg>
            <div className="quick-actions__action__textarea-wrapper">
                <input onInput={e => setTitle((e.target as HTMLInputElement).value)}
                    value={title}
                    placeholder="Title"
                    type="text" />
                <textarea ref={textarea} placeholder="Type in your text here..."></textarea>
                <div>
                    <ActionBtn text="Cancel" onClick={handleQuickTextClose} />
                    <ActionBtn text="Save"
                        textLoading="Saving"
                        onClick={handleQuickTextSave}
                        loading={savingQuickText} />
                </div>
            </div>
        </div>
    </div>)
}

export default QuickActions
