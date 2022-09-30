import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileDrop } from "react-file-drop"

import ActionBtn from "src/components/ActionBtn"

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
            <div className="add-file__col">
                {files.map((file, i) => (
                    <div className="add-file__file" key={i}>
                        <div className="add-file__file__top">
                            <img src={"/icon/" + file.name} className="add-file__file__icon" alt="icon" />
                            <div className="add-file__file__name">
                                {file.name}
                            </div>
                            <button onClick={() => handleRemove(file)} type="button" className="add-file__file__remove">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                    <path d="m6.4 19.8-2.2-2.2L9.8 12 4.2 6.4l2.2-2.2L12 9.8l5.6-5.6 2.2 2.2-5.6 5.6 5.6 5.6-2.2 2.2-5.6-5.6Z" />
                                </svg>
                            </button>
                        </div>
                        {/(.png|.jpg|.jpeg|.gif|.svg)$/.test(file.name) &&
                            <img className="add-file__file__preview" src={URL.createObjectURL(file)} alt="preview" />}
                    </div>
                ))}
            </div>
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
