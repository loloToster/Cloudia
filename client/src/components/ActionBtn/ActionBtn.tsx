import { MouseEvent, CSSProperties } from "react"
import "./ActionBtn.scss"

interface Props {
    text: string,
    onClick: ((e: MouseEvent) => any) | string,
    textLoading: string,
    loading: boolean,
    progress: number,
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
        progress,
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

    const progressPresent = typeof progress === "number"

    if (progressPresent && (progress < 0 || progress > 1))
        throw Error("Progress must be a float between 0 & 1")

    const progressPercentage = Math.round((progress || 0) * 100)

    return (<Tag onClick={onClick}
        href={href}
        download={download}
        className={`action-btn ${loading ? "loading" : ""} ${className || ""}`}
        target={newPage ? "_blank" : undefined}
        rel={newPage ? "noreferrer" : undefined}>
        <div className="action-btn__progress"
            style={{ "--value": progress } as CSSProperties}></div>
        <span className="action-btn__content">
            {text}
        </span>
        <span className="action-btn__loading">
            {textLoading}
            <span className="action-btn__loading-item">.</span>
            <span className="action-btn__loading-item">.</span>
            <span className="action-btn__loading-item">.</span>
            {progressPresent ? ` (${progressPercentage}%)` : ""}
        </span>
    </Tag>)
}

export default ActionBtn
