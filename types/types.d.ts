export interface ItemBaseJson {
    id: string,
    ip: string,
    title: string,
    created_at: Date,
    trashed: 0 | 1
}

export interface FileJson extends ItemBaseJson {
    type: "file" | "img"
}

export interface TextJson extends ItemBaseJson {
    type: "text",
    text: string
}

export type Item = FileJson | TextJson
