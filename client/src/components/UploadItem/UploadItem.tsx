import { CSSProperties } from "react"

import "./UploadItem.scss"

export interface Upload {
    numberOfFiles: number,
    progress: number
}

function UploadItem(props: Upload) {
    const { numberOfFiles, progress } = props

    if (progress < 0 || progress > 1)
        throw Error("Progress must be a float between 0 & 1")

    const progressPercentage = Math.round(progress * 100)

    let fileNaming = "file"
    if (numberOfFiles > 1) fileNaming += "s"

    return (<div className="upload-item">
        <div className="upload-item__title">
            Uploading {numberOfFiles} {fileNaming}
            <span className="upload-item__loading-item">.</span>
            <span className="upload-item__loading-item">.</span>
            <span className="upload-item__loading-item">.</span>
        </div>
        <div className="upload-item__progress">
            <div className="upload-item__progress__circle" style={{ "--progress": progress } as CSSProperties}>
                <div className="upload-item__progress__inner-circle">{progressPercentage}%</div>
            </div>
        </div>
    </div>)
}

export default UploadItem
