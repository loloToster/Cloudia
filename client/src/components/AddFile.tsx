import React, { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, SubmitHandler } from "react-hook-form"
import { FileDrop } from "react-file-drop"

interface Inputs {
    title: string,
    username: string,
    file: File | null
}

function AddFile() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
        setValue
    } = useForm<Inputs>()

    const fileInput = useRef<HTMLInputElement>(null)

    const [filePreview, setFilePreview] = useState("")
    const [loading, setLoading] = useState(false)

    const onSubmit: SubmitHandler<Inputs> = async ({ title, username, file }) => {
        if (loading) return

        let data = new FormData()

        data.append("title", title)
        data.append("username", username)
        data.append("file", file!)

        setLoading(true)
        fetch("/api/file", {
            method: "POST",
            body: data
        }).finally(() => {
            setTimeout(() => {
                setLoading(false)
                navigate("/")
            }, 500)
        })
    }

    const handleFileUpload = (files: FileList | null) => {
        const value = (files && files.length) ? files[0] : null

        setValue("file", value)
        setFilePreview(value ? `url("${URL.createObjectURL(value)}")` : "")

        if (!value) clearErrors("file")
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="add-file">
            <div className="add-file__col">
                <button onClick={() => fileInput.current?.click()}
                    type="button"
                    className={"add-file__choose-file" + (errors.file?.message ? " err" : "")}>
                    <FileDrop onDrop={handleFileUpload}>
                        <div className="add-file__choose-file__plus"></div>
                        <div className="add-file__choose-file__text">
                            Add a file
                        </div>
                        <div style={{ "--src": filePreview } as React.CSSProperties}
                            className="add-file__choose-file__preview"></div>
                    </FileDrop>
                </button>
                <input {...register("file", { required: "Upload a file" })}
                    onChange={e => handleFileUpload(e.target.files)}
                    accept="image/png,image/jpg"
                    ref={fileInput}
                    style={{ display: "none" }}
                    type="file" />
                <div className="add-file__input-validation">
                    {errors.file?.message?.toString()}
                </div>
            </div>
            <div className="add-file__col">
                <input {...register("title", {
                    required: "This field is required",
                    maxLength: 32
                })} type="text" placeholder="Title" className={errors.title ? "err" : ""} />
                <div className="add-file__input-validation">
                    {errors.title?.message}
                </div>
                <input {...register("username", {
                    required: "This field is required",
                    maxLength: 16,
                    value: "Anonymous"
                })} type="text" placeholder="Username" className={errors.username ? "err" : ""} />
                <div className="add-file__input-validation">
                    {errors.username?.message}
                </div>
                <button className={`action-btn ${loading ? "loading" : ""}`} type="submit">
                    <span className="action-btn__content">Upload</span>
                    <span className="action-btn__loading">
                        Loading
                        <span className="action-btn__loading-item">.</span>
                        <span className="action-btn__loading-item">.</span>
                        <span className="action-btn__loading-item">.</span>
                    </span>
                </button>
            </div>
        </form>
    )
}

export default AddFile
