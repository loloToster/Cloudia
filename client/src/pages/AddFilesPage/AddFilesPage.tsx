import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileDrop } from "react-file-drop"

import "./AddFilesPage.scss"

import ActionBtn from "src/components/ActionBtn/ActionBtn"
import UploadedFilesList from "src/components/UploadedFilesList/UploadedFilesList"

function AddFiles() {
    const navigate = useNavigate()

    const fileInput = useRef<HTMLInputElement>(null)

    const [files, setFiles] = useState<File[]>([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleFileUpload = (fl: FileList | null) => {
        setFiles(prevFiles => prevFiles.concat(Array.from(fl || [])))
        setError("")
    }

    const handleRemove = (file: File) => {
        setFiles(prevFiles => prevFiles.filter(fl => fl !== file))
    }

    const handleSubmit = () => {
        if (loading) return

        if (!files.length)
            return setError("Upload at least one file")

        let data = new FormData()
        files.forEach(f => data.append("files", f))

        setLoading(true)

        const req = new XMLHttpRequest()

        req.addEventListener("readystatechange", () => {
            if (req.readyState === 4) {
                setLoading(false)
                navigate("/")
            }
        })

        req.upload.addEventListener("progress", e => setProgress(e.loaded / e.total))

        req.open("post", "/api/file")
        req.send(data)
    }

    return (
        <div className="add-file">
            <UploadedFilesList className="add-file__col" files={files} handleDelete={handleRemove} />
            <div className="add-file__col">
                <button onClick={() => fileInput.current?.click()}
                    type="button"
                    className={`add-file__choose-file ${error ? "err" : ""}`}>
                    <FileDrop onDrop={handleFileUpload}>
                        <div className="add-file__choose-file__plus"></div>
                        <div className="add-file__choose-file__text">
                            Add a file
                        </div>
                    </FileDrop>
                </button>
                <input onChange={e => handleFileUpload(e.target.files)}
                    ref={fileInput}
                    style={{ display: "none" }}
                    type="file"
                    multiple />
                <div className="add-file__input-validation">{error}</div>
                <ActionBtn text="Upload"
                    textLoading="Uploading"
                    onClick={handleSubmit}
                    loading={loading}
                    progress={progress}
                    className="add-file__upload" />
            </div>
        </div>
    )
}

export default AddFiles
