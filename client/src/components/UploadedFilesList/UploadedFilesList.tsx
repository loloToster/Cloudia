import "./UploadedFilesList.scss"

function UploadedFilesList(props: { files: File[], handleDelete: Function, className?: string }) {
    const { files, handleDelete, className } = props

    return (
        <ul className={"upload-list " + (className || "")}>
            {files.map((file, i) => (
                <li className="upload-list__file" key={i}>
                    <div className="upload-list__file__top">
                        <img src={"/icon/" + file.name} className="upload-list__file__icon" alt="icon" />
                        <div className="upload-list__file__name">
                            {file.name}
                        </div>
                        <button onClick={() => handleDelete(file)}
                            title="Remove File"
                            type="button"
                            className="upload-list__file__remove">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                <path d="m6.4 19.8-2.2-2.2L9.8 12 4.2 6.4l2.2-2.2L12 9.8l5.6-5.6 2.2 2.2-5.6 5.6 5.6 5.6-2.2 2.2-5.6-5.6Z" />
                            </svg>
                        </button>
                    </div>
                    {/(.png|.jpg|.jpeg|.gif|.svg)$/.test(file.name) &&
                        <img className="upload-list__file__preview" src={URL.createObjectURL(file)} alt="preview" />}
                </li>
            ))}
        </ul>
    )
}

export default UploadedFilesList
