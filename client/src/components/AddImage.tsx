import { useRef } from "react"
import { useForm, SubmitHandler } from "react-hook-form"

interface Inputs {
    title: string,
    username: string,
    image: any
}

function AddImage() {
    const imageInput = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = ({ title, username }) => {
        const images = imageInput.current?.files
        if (!images)
            return setError("image", {
                message: "Upload an image"
            })

        let data = new FormData()

        data.append("title", title)
        data.append("username", username)
        data.append("image", images[0])

        fetch("/api/image", {
            method: "POST",
            body: data
        })
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
                </button>
                <input {...register("image")}
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
