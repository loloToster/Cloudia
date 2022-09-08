export interface TextJson {
    is_file: 0,
    id: string,
    text: string,
    ip: string,
    created_at: Date
}

export interface FileJson {
    is_file: 1,
    id: string,
    title: string,
    ip: string,
    icon: string,
    created_at: Date
}

export type Item = FileJson | TextJson
