import React, { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, SubmitHandler } from "react-hook-form"
import { FileDrop } from "react-file-drop"

interface Inputs {
    title: string,
    username: string,
    files: File[]
}

function useForceUpdate() {
    const [value, setValue] = useState(0)
    return () => setValue(value => value + 1)
}

function AddFile() {
    const navigate = useNavigate()
    const forceUpdate = useForceUpdate()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        clearErrors
    } = useForm<Inputs>()

    const fileInput = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(false)

    const onSubmit: SubmitHandler<Inputs> = async ({ title, username, files }) => {
        if (loading) return

        let data = new FormData()

        data.append("title", title)
        data.append("username", username)

        files.forEach(f => data.append("files", f))

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

    const handleFileUpload = (fl: FileList | null) => {
        const newFiles = getValues("files").concat(Array.from(fl || []))
        setValue("files", newFiles)
        forceUpdate()
        if (fl?.length) clearErrors("files")
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="add-file">
            <div className="add-file__col">
                {getValues("files")?.map((file, i) => (
                    <div className="add-file__file" key={i}>
                        <div className="add-file__file__top">
                            <img src={"/icon/" + file.name} className="add-file__file__icon" />
                            <div className="add-file__file__name">
                                {file.name}
                            </div>
                            <button type="button" className="add-file__file__remove">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                    <path d="m6.4 19.8-2.2-2.2L9.8 12 4.2 6.4l2.2-2.2L12 9.8l5.6-5.6 2.2 2.2-5.6 5.6 5.6 5.6-2.2 2.2-5.6-5.6Z" />
                                </svg>
                            </button>
                        </div>
                        {/(.png|.jpg|.jpeg|.gif)$/.test(file.name) &&
                            <img className="add-file__file__preview" src={URL.createObjectURL(file)} alt="preview" />}
                    </div>
                ))}
                <button onClick={() => fileInput.current?.click()}
                    type="button"
                    className={"add-file__choose-file" + (errors.files?.message ? " err" : "")}>
                    <FileDrop onDrop={handleFileUpload}>
                        <div className="add-file__choose-file__plus"></div>
                        <div className="add-file__choose-file__text">
                            Add a file
                        </div>
                    </FileDrop>
                </button>
                <input {...register("files", { required: "Upload a file", value: [] })}
                    onChange={e => handleFileUpload(e.target.files)}
                    ref={fileInput}
                    style={{ display: "none" }}
                    type="file"
                    multiple />
                <div className="add-file__input-validation">
                    {errors.files?.message?.toString()}
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
