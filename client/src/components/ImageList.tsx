import React from "react"

export interface Image {
    id: number,
    title: string,
    user: string,
    src: string
}

function ImageList({ images }: { images: Image[] }) {
    return (
        <div className="images">
            {
                images.map(img => (
                    <div style={{ "--src": `url("${img.src}")` } as React.CSSProperties}
                        className="images__image"
                        key={img.id}>
                    </div>
                ))
            }
        </div>
    )
}

export default ImageList
