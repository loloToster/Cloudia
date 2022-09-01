import React, { useEffect, useState } from "react"

export interface Image {
    id: string,
    title: string,
    user: string,
    file: string
}

function ImageList() {
    const [images, setImages] = useState<Image[]>([])

    useEffect(() => {
        fetch("/api/images")
            .then(async data => {
                const json = await data.json()
                console.log(json)
                setImages(json)
            }).catch(console.error)
    }, [])

    return (
        <div className="images">
            {
                images.map(img => (
                    <div style={{ "--src": `url("/cdn/${img.file}")` } as React.CSSProperties}
                        className="images__image"
                        key={img.id}>
                    </div>
                ))
            }
        </div>
    )
}

export default ImageList
