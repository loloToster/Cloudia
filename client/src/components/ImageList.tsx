import React, { useEffect, useState } from "react"

export interface Image {
    id: string,
    title: string,
    user: string,
    file: string
}

function ImageList() {
    const [images, setImages] = useState<Image[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/images")
            .then(async data => {
                const json = await data.json()
                setImages(json)
            }).catch(err => {
                console.error(err)
            }).finally(() => {
                setLoading(false)
            })
    }, [])

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        let res = await fetch("/api/image/" + id, { method: "DELETE" })
        if (res.ok) setImages(images.filter(img => img.id !== id))
    }

    return (
        <div className="images">
            {!loading && images.map(img => (
                <div style={{ "--src": `url("/cdn/${img.file}")` } as React.CSSProperties}
                    className="images__image"
                    key={img.id}>
                    <div className="images__options">
                        <div className="images__metadata">
                            <div className="images__title">{img.title}</div>
                            <div className="images__user">{img.user}</div>
                        </div>
                        <a href={`cdn/${img.file}`} download={img.file} className="images__button images__button--download">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                <path d="M6 20q-.825 0-1.412-.587Q4 18.825 4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413Q18.825 20 18 20Zm6-4-5-5 1.4-1.45 2.6 2.6V4h2v8.15l2.6-2.6L17 11Z" />
                            </svg>
                        </a>
                        <button onClick={e => handleDelete(e, img.id)} className="images__button images__button--delete">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2ZM7 6v13Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ImageList
