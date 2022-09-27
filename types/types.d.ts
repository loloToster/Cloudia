// .d.ts instead of .ts to avoid compilation of this file

export interface TextJson {
    is_file: 0,
    id: string,
    title: "",
    ip: string,
    icon: "",
    text: string,
    created_at: Date
}

export interface FileJson {
    is_file: 1,
    id: string,
    title: string,
    ip: string,
    icon: string,
    text: "",
    created_at: Date
}

export type Item = FileJson | TextJson
