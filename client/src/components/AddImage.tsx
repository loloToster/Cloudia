import React, { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, SubmitHandler } from "react-hook-form"
import { FileDrop } from "react-file-drop"

interface Inputs {
    title: string,
    username: string,
    image: File | null
}

function AddImage() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
        setValue
    } = useForm<Inputs>()

    const imageInput = useRef<HTMLInputElement>(null)

    const [imagePreview, setImagePreview] = useState("")
    const [loading, setLoading] = useState(false)

    const onSubmit: SubmitHandler<Inputs> = async ({ title, username, image }) => {
        if (loading) return

        let data = new FormData()

        data.append("title", title)
        data.append("username", username)
        data.append("image", image!)

        setLoading(true)
        fetch("/api/image", {
            method: "POST",
            body: data
        }).finally(() => {
            setTimeout(() => {
                setLoading(false)
                navigate("/")
            }, 500)
        })
    }

    const handleImageUpload = (files: FileList | null) => {
        const value = (files && files.length) ? files[0] : null

        setValue("image", value)
        setImagePreview(value ? `url("${URL.createObjectURL(value)}")` : "")

        if (!value) clearErrors("image")
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="add-image">
            <div className="add-image__col">
                <button onClick={() => imageInput.current?.click()}
                    type="button"
                    className={"add-image__choose-file" + (errors.image?.message ? " err" : "")}>
                    <FileDrop onDrop={handleImageUpload}>
                        <div className="add-image__choose-file__plus"></div>
                        <div className="add-image__choose-file__text">
                            Add an image
                        </div>
                        <div style={{ "--src": imagePreview } as React.CSSProperties}
                            className="add-image__choose-file__preview"></div>
                    </FileDrop>
                </button>
                <input {...register("image", { required: "Upload an image" })}
                    onChange={e => handleImageUpload(e.target.files)}
                    ref={imageInput}
                    accept="image/png, image/jpeg"
                    style={{ display: "none" }}
                    type="file" />
                <div className="add-image__input-validation">
                    {errors.image?.message?.toString()}
                </div>
            </div>
            <div className="add-image__col">
                <input {...register("title", {
                    required: "This field is required",
                    maxLength: 32
                })} type="text" placeholder="Title" className={errors.title ? "err" : ""} />
                <div className="add-image__input-validation">
                    {errors.title?.message}
                </div>
                <input {...register("username", {
                    required: "This field is required",
                    maxLength: 16,
                    value: "Anonymous"
                })} type="text" placeholder="Username" className={errors.username ? "err" : ""} />
                <div className="add-image__input-validation">
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

export default AddImage
