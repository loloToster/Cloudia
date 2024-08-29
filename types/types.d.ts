export interface ItemBaseJson {
    id: string,
    ip: string,
    title: string,
    created_at: Date,
    trashed: 0 | 1,
    folder: null | string
}

export interface FileJson extends ItemBaseJson {
    type: "file" | "img"
}

export interface TextJson extends ItemBaseJson {
    type: "text",
    text: string
}

export interface FolderJson extends ItemBaseJson {
    type: "folder"
}

export type Item = FileJson | TextJson | FolderJson

export interface ClientBase { selected: boolean }

export type ClientFileJson = FileJson & ClientBase
export type ClientTextJson = TextJson & ClientBase
export type ClientFolderJson = FolderJson & ClientBase

export type ClientItem = ClientFileJson | ClientTextJson | ClientFolderJson
