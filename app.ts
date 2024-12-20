import express, { Router } from "express"
import multer from "multer"
import sqlite3 from "sqlite3"
import { v4 as uuid } from "uuid"
import { getClientIp } from "request-ip"
import { getIconForFile } from "vscode-icons-js"

import path from "path"
import fs from "fs"
import { rm as removeAsync, rename as renameAsync } from "fs/promises"

import { FileJson, FolderJson, TextJson } from "./types/types"

process.title = "Cloudia"

const dataFilesDir = fs.existsSync(`${__dirname}/data`) ? `${__dirname}/data` : __dirname

const dbPath = dataFilesDir + "/database.db"
const cdnDir = dataFilesDir + "/cdn"
const tmpFileDir = dataFilesDir + "/tmp"

if (fs.existsSync(tmpFileDir))
    fs.rmSync(tmpFileDir, { recursive: true, force: true })

if (!fs.existsSync(cdnDir))
    fs.mkdirSync(cdnDir)

const PORT = 3001
const app = express()

const DataBase = sqlite3.verbose().Database

async function dbRunAsync(db: sqlite3.Database, sql: string) {
    return new Promise<void>(res => {
        // ignore errors
        db.run(sql, (err) => {
            if (err) console.warn(err.message)
            res()
        })
    })
}

const db = new DataBase(dbPath, async err => {
    if (err) {
        console.error("Error while connecting to database:\n", err)
        return
    }

    console.log("Connected to database")

    await dbRunAsync(
        db,
        `CREATE TABLE IF NOT EXISTS items (
            type TEXT,
            id TEXT,
            title TEXT,
            ip TEXT,
            text TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    )

    await dbRunAsync(
        db,
        `ALTER TABLE items ADD COLUMN trashed INTEGER DEFAULT 0`,
    )

    await dbRunAsync(
        db,
        `ALTER TABLE items ADD COLUMN folder TEXT DEFAULT NULL`,
    )

    await dbRunAsync(
        db,
        `ALTER TABLE items ADD COLUMN pinned INTEGER DEFAULT 0`,
    )

    app.listen(PORT, () => {
        console.log("Listening on port", PORT)
    })
})

// API
const apiRouter = Router()

const upload = multer({ dest: tmpFileDir })
const jsonParser = express.json()

function addFiles(files: Express.Multer.File[], ip: string, folder?: string, folderId?: string) {
    return new Promise<(FileJson | FolderJson)[]>(async (res, rej) => {
        let newFolder: FolderJson | null = null

        if (typeof folder === "string") {
            try {
                newFolder = {
                    type: "folder",
                    id: uuid(),
                    title: folder,
                    ip,
                    folder: folderId ?? null, // todo: check if folder exists
                    created_at: new Date().getTime(),
                    trashed: 0,
                    pinned: 0
                }

                await new Promise<void>((r, rj) => {
                    const { type: t, id, title, ip, folder } = newFolder as FolderJson

                    db.run(
                        `INSERT INTO items(type, id, title, ip, folder) VALUES (?, ?, ?, ?, ?)`,
                        [t, id, title, ip, folder],
                        err => err ? rj(err) : r()
                    )
                })
            } catch (error) {
                rej(error)
            }
        }

        let newDbItems: FileJson[] = []

        for (const file of files) {
            const id = (
                uuid() + path.extname(file.originalname)
            ).toLowerCase()

            try {
                await renameAsync(file.path, `${cdnDir}/${id}`)

                newDbItems.push({
                    type: /(.png|.jpg|.jpeg|.gif|.svg)$/.test(id) ? "img" : "file",
                    id,
                    title: file.originalname,
                    ip,
                    folder: newFolder?.id ?? folderId ?? null,
                    created_at: new Date().getTime(),
                    trashed: 0,
                    pinned: 0
                })
            } catch (err) {
                console.error(err)
            }
        }

        if (files.length) {
            const paramsPlaceholders = newDbItems.map(() => "(?, ?, ?, ?, ?)").join(", ")
            const params = newDbItems.map(item => {
                let parsedItem = Object.values(item)
                // remove created_at & trashed & pinned
                parsedItem.splice(-3)
                return parsedItem
            }).flat()

            db.run(
                `INSERT INTO items(type, id, title, ip, folder) VALUES ${paramsPlaceholders}`,
                params,
                err => err ? rej(err) : res(newFolder ? [newFolder] : newDbItems)
            )
        } else if (newFolder) {
            res([newFolder])
        } else {
            console.warn("invalid use of addFiles")
        }
    })
}

apiRouter.post("/file", upload.array("files"), async (req, res) => {
    const ip = getClientIp(req)

    const files = req.files
    let folder: string | undefined = undefined
    let folderId: string | undefined = undefined
    const bodyFolder: unknown = req.body.folder
    const bodyFolderId: unknown = req.body.folderId

    if (typeof bodyFolder === "string")
        folder = bodyFolder

    if (typeof bodyFolderId === "string")
        folderId = bodyFolderId

    if (!Array.isArray(files) || (!files.length && typeof folder !== "string"))
        return res.status(400).send()

    const newItems = await addFiles(files, ip || "unknown", folder, folderId)

    res.send(newItems)
})

apiRouter.post("/text", jsonParser, async (req, res) => {
    if (typeof req.body.text !== "string")
        return res.status(400).send()

    const newItem: TextJson = {
        type: "text",
        id: uuid(),
        title: req.body.title || "",
        ip: getClientIp(req) || "unknown",
        text: req.body.text,
        folder: req.body.folderId ?? null, // todo: check if folder exists
        created_at: new Date().getTime(),
        trashed: 0,
        pinned: 0
    }

    let params = Object.values(newItem)
    // remove created_at & trashed & pinned
    params.splice(-3)

    db.run(
        `INSERT INTO items(type, id, title, ip, text, folder) VALUES (?, ?, ?, ?, ?, ?)`,
        params,
        err => {
            if (err) return res.status(500).send()
            res.send([newItem])
        }
    )
})

apiRouter.get("/item/:id", async (req, res) => {
    db.get(
        "SELECT * FROM items WHERE id = ?",
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).send()
            res.send(row)
        }
    )
})

const supportedPatchFields: Record<string, string | undefined> = {
    title: "string",
    text: "string"
}

apiRouter.patch("/item/:id", jsonParser, async (req, res) => {
    const { id } = req.params

    const { field, value } = req.body

    if (
        typeof value !== supportedPatchFields[field]
    ) {
        return res.status(400).send()
    }

    db.run(
        `UPDATE items SET ${field}=? WHERE id = ?`,
        [value, id],
        async err => {
            if (err) return res.status(500).send()
            res.send()
        }
    )
})

apiRouter.patch(
    ["/item/:id/trash", "/item/:id/restore"],
    async (req, res) => {
        const { id } = req.params
        const trashed = req.path.includes("trash") ? 1 : 0

        db.run(
            `UPDATE items SET trashed=${trashed} WHERE id = ?`,
            [id],
            async err => {
                if (err) return res.status(500).send()
                res.send()
            }
        )
    }
)

apiRouter.patch(
    ["/item/:id/pin", "/item/:id/unpin"],
    async (req, res) => {
        const { id } = req.params
        const pinned = req.path.includes("unpin") ? 0 : 1

        db.run(
            `UPDATE items SET pinned=${pinned} WHERE id = ?`,
            [id],
            async err => {
                if (err) return res.status(500).send()
                res.send()
            }
        )
    }
)

async function getFolderIds(ids: string[]): Promise<string[]> {
    return new Promise<any[]>((res, rej) => {
        const idsPlaceholders = "?, ".repeat(ids.length).slice(0, -2)

        db.all(
            `
            WITH RECURSIVE items_to_delete AS (
                SELECT id
                FROM items
                WHERE folder IN (${idsPlaceholders})
    
                UNION ALL
    
                SELECT i.id
                FROM items i
                JOIN items_to_delete itd ON i.folder = itd.id
            )
            SELECT id FROM items_to_delete;
            `,
            ids,
            (err, rows) => {
                if (err) return rej(err)
                res([...ids, ...rows.map((r: any) => r.id)])
            }
        )

    })
}

async function permamentlyDeleteItems(ids: string[]) {
    // expand ids by folder items
    ids = await getFolderIds(ids)
    const idsPlaceholders = "?, ".repeat(ids.length).slice(0, -2)

    return new Promise<void>((res, rej) => {
        db.run(
            `DELETE FROM items WHERE id IN (${idsPlaceholders})`,
            ids,
            async err => {
                if (err) return rej(err)

                try {
                    for (const id of ids) {
                        await removeAsync(`${cdnDir}/${id}`, { force: true })
                    }

                    res()
                } catch (err) {
                    rej(err)
                }
            }
        )
    })
}

apiRouter.delete("/item/:id", async (req, res) => {
    const { id } = req.params

    try {
        await permamentlyDeleteItems([id])
        res.send()
    } catch {
        res.status(500).send()
    }
})

apiRouter.get("/items", async (req, res) => {
    const { trashed, q } = req.query

    const textSearch = typeof q === "string" ?
        `AND title LIKE '%' || ? || '%'` :
        ""

    db.all(
        trashed === "true" ?
            `SELECT * FROM items WHERE trashed = 1 ${textSearch} ORDER BY pinned DESC, created_at DESC` :
            `SELECT * FROM items WHERE folder IS NULL AND trashed = 0 ${textSearch} ORDER BY pinned DESC, created_at DESC`
        ,
        [q],
        (err, rows) => {
            if (err) return res.status(500).send()
            res.send(rows)
        }
    )
})

apiRouter.get("/folderpath/:id", async (req, res) => {
    const { id } = req.params

    db.all(
        `
        WITH RECURSIVE parent_folders AS (
            SELECT *
            FROM items
            WHERE id = ?

            UNION ALL

            SELECT i.*
            FROM items i
            JOIN parent_folders p ON i.id = p.folder
        )

        SELECT * FROM parent_folders;
        `,
        [id],
        (err, rows) => {
            if (err) return res.status(500).send()
            res.send(rows.reverse())
        }
    )
})

apiRouter.get("/folder/:id", async (req, res) => {
    const { id } = req.params

    db.all(
        `SELECT * FROM items WHERE folder = ? ORDER BY created_at DESC`,
        [id],
        (err, rows) => {
            if (err) return res.status(500).send()
            res.send(rows)
        }
    )
})

function validateIdsBody(body: Record<string, unknown>) {
    return Array.isArray(body?.ids) &&
        body.ids.every(id => typeof id === "string") &&
        body.ids.length
}

apiRouter.patch(["/items/trash", "/items/restore"], jsonParser, (req, res) => {
    if (!validateIdsBody(req.body)) {
        return res.status(400).send()
    }

    const trashed = req.path.includes("trash") ? 1 : 0
    const { ids } = req.body
    const idsPlaceholders = "?, ".repeat(ids.length).slice(0, -2)

    db.run(
        `UPDATE items SET trashed=${trashed} WHERE id IN (${idsPlaceholders})`,
        ids,
        err => {
            if (err) return res.status(500).send()
            res.send()
        }
    )
})

apiRouter.patch(["/items/pin", "/items/unpin"], jsonParser, (req, res) => {
    if (!validateIdsBody(req.body)) {
        return res.status(400).send()
    }

    const pinned = req.path.includes("unpin") ? 0 : 1
    const { ids } = req.body
    const idsPlaceholders = "?, ".repeat(ids.length).slice(0, -2)

    db.run(
        `UPDATE items SET pinned=${pinned} WHERE id IN (${idsPlaceholders})`,
        ids,
        err => {
            if (err) return res.status(500).send()
            res.send()
        }
    )
})

apiRouter.delete("/items", jsonParser, async (req, res) => {
    if (!validateIdsBody(req.body)) {
        return res.status(400).send()
    }

    const { ids } = req.body

    try {
        await permamentlyDeleteItems(ids)
        res.send()
    } catch {
        res.status(500).send()
    }
})

app.use("/api", apiRouter)

// cdn
app.get("/cdn/:file", (req, res) => {
    res.sendFile(`${cdnDir}/${req.params.file}`, err => {
        if (err) {
            console.error(err)
            res.status(404).send()
        }
    })
})

// icons
app.get("/icon/:file", (req, res) => {
    const fileName = req.params.file
    res.redirect(`https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/${getIconForFile(fileName)}`)
})

// React App
app.use(express.static(__dirname + "/client/build"))

app.get("/*", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html")
})
