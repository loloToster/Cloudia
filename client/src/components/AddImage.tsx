function AddImage() {
    return (
        <form className="add-image">
            <div className="add-image__col">
                <button type="button" className="add-image__choose-file">
                    <div className="add-image__choose-file__plus"></div>
                    <div className="add-image__choose-file__text">
                        Add an image
                    </div>
                </button>
                <input accept="image/png, image/jpeg" style={{ display: "none" }} type="file" name="image" />
            </div>
            <div className="add-image__col">
                <input maxLength={32} required type="text" name="title" placeholder="Title" />
                <input maxLength={16} required type="text" name="user" placeholder="Username" />
                <button className="action-btn" type="submit">Submit</button>
            </div>
        </form>
    )
}

export default AddImage
