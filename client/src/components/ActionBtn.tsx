import { MouseEvent } from "react"

interface Props {
    text: string,
    onClick: ((e: MouseEvent) => any) | string,
    textLoading: string,
    loading: boolean,
    download: string,
    newPage: boolean,
    className: string
}

function ActionBtn(props: Partial<Props>) {
    const {
        text = "Button",
        onClick: clickHandler,
        textLoading = "Loading",
        loading = false,
        download,
        newPage = false,
        className
    } = props

    let Tag: "button" | "a" = "button"
    let onClick: ((e: MouseEvent) => any) | undefined
    let href: string | undefined

    if (typeof clickHandler == "string") {
        href = clickHandler
        Tag = "a"
    } else {
        onClick = clickHandler
    }

    return (<Tag onClick={onClick}
        href={href}
        download={download}
        className={`action-btn ${loading ? "loading" : ""} ${className || ""}`}
        target={newPage ? "_blank" : undefined}
        rel={newPage ? "noreferrer" : undefined}>
        <span className="action-btn__content">
            {text}
        </span>
        <span className="action-btn__loading">
            {textLoading}
            <span className="action-btn__loading-item">.</span>
            <span className="action-btn__loading-item">.</span>
            <span className="action-btn__loading-item">.</span>
        </span>
    </Tag>)
}

export default ActionBtn
