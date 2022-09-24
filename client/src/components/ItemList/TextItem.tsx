import { useRef, MouseEvent } from "react"
import { TextJson } from "@backend-types/types"

// https://stackoverflow.com/questions/71873824/copy-text-to-clipboard-cannot-read-properties-of-undefined-reading-writetext
function copyToClipboard(text: string) {
    if (window.isSecureContext && navigator.clipboard) {
        navigator.clipboard.writeText(text)
    } else {
        const textArea = document.createElement("textarea")
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

function TextItem(props: { textItem: TextJson, removeItem: Function }) {
    const { textItem, removeItem } = props

    const handleDelete = async (id: string) => {
        let res = await fetch("/api/item/" + id, { method: "DELETE" })
        if (res.ok) removeItem(id)
    }

    const copyBtn = useRef<HTMLButtonElement>(null)

    let copyTimeout: any
    const handleCopy = (e: MouseEvent) => {
        const button = copyBtn.current
        if (!button) return

        clearTimeout(copyTimeout)
        copyToClipboard(textItem.text);
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
            <button onClick={() => handleDelete(textItem.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                    <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2ZM7 6v13Z"></path>
                </svg>
            </button>
            <button onClick={handleCopy} ref={copyBtn}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                    <path d="M5 22q-.825 0-1.413-.587Q3 20.825 3 20V6h2v14h11v2Zm4-4q-.825 0-1.412-.587Q7 16.825 7 16V4q0-.825.588-1.413Q8.175 2 9 2h9q.825 0 1.413.587Q20 3.175 20 4v12q0 .825-.587 1.413Q18.825 18 18 18Zm0-2h9V4H9v12Zm0 0V4v12Z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                    <path d="m9.55 18.55-6.3-6.3 1.875-1.875L9.55 14.8l9.375-9.375L20.8 7.3Z" />
                </svg>
            </button>
        </div>
        <div className="text-item__text" dangerouslySetInnerHTML={{ __html: urlify(textItem.text) }}></div>
    </div>)
}

export default TextItem
