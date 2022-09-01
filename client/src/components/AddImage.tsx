import { useRef } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useNavigate } from "react-router-dom"

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
    const imagePreview = useRef<HTMLDivElement>(null)

    const onSubmit: SubmitHandler<Inputs> = async ({ title, username, image }) => {
        let data = new FormData()

        data.append("title", title)
        data.append("username", username)
        data.append("image", image!)

        fetch("/api/image", {
            method: "POST",
            body: data
        }).finally(() => {
            navigate("/")
        })
    }

    const handleImageUpload = (e: React.ChangeEvent) => {
        const input = e.target as HTMLInputElement
        const value = input.files && input.files.length ? input.files[0] : null

        setValue("image", value)

        if (!value) return

        clearErrors("image")
        imagePreview.current?.style.setProperty("--src", `url("${URL.createObjectURL(value)}")`)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="add-image">
            <div className="add-image__col">
                <button onClick={() => imageInput.current?.click()}
                    type="button"
                    className={"add-image__choose-file" + (errors.image?.message ? " err" : "")}>
                    <div className="add-image__choose-file__plus"></div>
                    <div className="add-image__choose-file__text">
                        Add an image
                    </div>
                    <div ref={imagePreview} className="add-image__choose-file__preview"></div>
                </button>
                <input {...register("image", { required: "Upload an image" })}
                    onChange={handleImageUpload}
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
                    maxLength: 16
                })} type="text" placeholder="Username" className={errors.username ? "err" : ""} />
                <div className="add-image__input-validation">
                    {errors.username?.message}
                </div>
                <button className="action-btn" type="submit">Submit</button>
            </div>
        </form>
    )
}

export default AddImage
