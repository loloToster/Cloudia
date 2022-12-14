import { useRef, MouseEvent } from "react"
import { TextJson } from "@backend-types/types"

import "./TextItem.scss"

// https://stackoverflow.com/questions/71873824/copy-text-to-clipboard-cannot-read-properties-of-undefined-reading-writetext
async function copyToClipboard(text: string) {
    try {
        await window.navigator.clipboard.writeText(text)
    } catch {
        console.warn("could not copy with clipboard.writeText")

        const textArea = document.createElement("textarea")

        // Avoid scrolling to bottom
        textArea.style.top = "0"
        textArea.style.left = "0"
        textArea.style.position = "fixed"

        textArea.value = text
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
            document.execCommand("copy")
        } catch (err) {
            console.error("Unable to copy to clipboard", err)
        }

        document.body.removeChild(textArea)
    }
}

// https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

// https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
function urlify(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g

    text = escapeHtml(text)

    return text.replace(
        urlRegex,
        (url) => `<a href="${url}" target="_blank">${url}</a>`
    )
}

function TextItem(props: { textItem: TextJson, onDelete: Function, onRestore: Function }) {
    const { textItem, onDelete, onRestore } = props

    const copyBtn = useRef<HTMLButtonElement>(null)

    let copyTimeout: any
    const handleCopy = (e: MouseEvent) => {
        const button = copyBtn.current
        if (!button) return

        clearTimeout(copyTimeout)
        copyToClipboard(textItem.text)
        button.classList.remove("success")
        // restarts color animation
        void button.querySelector("svg:nth-child(2)")?.scrollHeight
        button.classList.add("success")

        copyTimeout = setTimeout(() => {
            button.classList.remove("success")
        }, 3000)
    }

    return (<div className="text-item">
        <div className="text-item__options">
            <div className="text-item__metadata">
                <div className="text-item__title">{textItem.title || "No Title"}</div>
                <div className="text-item__user">{textItem.ip}</div>
            </div>
            <button onClick={() => onDelete(textItem.id)} title="Delete Text">
                {textItem.trashed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path d="m9.4 16.5 2.6-2.6 2.6 2.6 1.4-1.4-2.6-2.6L16 9.9l-1.4-1.4-2.6 2.6-2.6-2.6L8 9.9l2.6 2.6L8 15.1ZM7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM7 6v13Z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2ZM7 6v13Z"></path>
                    </svg>
                )}
            </button>
            {textItem.trashed ? (
                <button onClick={() => onRestore(textItem.id)} title="Restore Text">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path d="M11 16h2v-4.15l1.6 1.55L16 12l-4-4-4 4 1.4 1.4 1.6-1.55Zm-4 5q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM7 6v13Z" />
                    </svg>
                </button>
            ) : (
                <button onClick={handleCopy} ref={copyBtn} title="Copy Text">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path d="M5 22q-.825 0-1.413-.587Q3 20.825 3 20V6h2v14h11v2Zm4-4q-.825 0-1.412-.587Q7 16.825 7 16V4q0-.825.588-1.413Q8.175 2 9 2h9q.825 0 1.413.587Q20 3.175 20 4v12q0 .825-.587 1.413Q18.825 18 18 18Zm0-2h9V4H9v12Zm0 0V4v12Z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path d="m9.55 18.55-6.3-6.3 1.875-1.875L9.55 14.8l9.375-9.375L20.8 7.3Z" />
                    </svg>
                </button>
            )}
        </div>
        <div className="text-item__text">
            <pre dangerouslySetInnerHTML={{ __html: urlify(textItem.text) }}></pre>
        </div>
    </div>)
}

export default TextItem
