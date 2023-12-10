import express, { Router } from "express"
import multer from "multer"
import sqlite3 from "sqlite3"
import { v4 as uuid } from "uuid"
import { getClientIp } from "request-ip"
import { getIconForFile } from "vscode-icons-js"

import path from "path"
import fs from "fs"
import { rm as removeAsync, rename as renameAsync } from "fs/promises"

import { FileJson, TextJson } from "./types/types"

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
const db = new DataBase(dbPath, err => {
    if (err) {
        console.error("Error while connecting to database:\n", err)
        return
    }

    console.log("Connected to database")

    db.run(
        `CREATE TABLE IF NOT EXISTS items (
            type TEXT,
            id TEXT,
            title TEXT,
            ip TEXT,
            text TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    )

    db.run(
        `ALTER TABLE items ADD COLUMN trashed INTEGER DEFAULT 0`,
        // ignore error if column already exists
        () => null
    )

    app.listen(PORT, () => {
        console.log("Listening on port", PORT)
    })
})

// API
const apiRouter = Router()

const upload = multer({ dest: tmpFileDir })
const jsonParser = express.json()

function addFiles(files: Express.Multer.File[], ip: string) {
    return new Promise<FileJson[]>(async (res, rej) => {
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
                    created_at: new Date(),
                    trashed: 0
                })
            } catch (err) {
                console.error(err)
            }
        }

        const paramsPlaceholders = newDbItems.map(() => "(?, ?, ?, ?)").join(", ")
        const params = newDbItems.map(item => {
            let parsedItem = Object.values(item)
            // remove created_at & trashed
            parsedItem.splice(-2)
            return parsedItem
        }).flat()

        db.run(
            `INSERT INTO items(type, id, title, ip) VALUES ${paramsPlaceholders}`,
            params,
            err => err ? rej(err) : res(newDbItems)
        )
    })
}

apiRouter.post("/file", upload.array("files"), async (req, res) => {
    const ip = getClientIp(req)

    const files = req.files

    if (!Array.isArray(files) || !files.length)
        return res.status(400).send()

    const newItems = await addFiles(files, ip || "unknown")

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
        created_at: new Date(),
        trashed: 0
    }

    let params = Object.values(newItem)
    // remove created_at & trashed
    params.splice(-2)

    db.run(
        `INSERT INTO items(type, id, title, ip, text) VALUES (?, ?, ?, ?, ?)`,
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

apiRouter.delete("/item/:id", async (req, res) => {
    const { id } = req.params

    db.run(
        "DELETE FROM items WHERE id = ?",
        [id],
        async err => {
            if (err) return res.status(500).send()

            try {
                await removeAsync(`${cdnDir}/${id}`, { force: true })
                res.send()
            } catch {
                res.status(500).send()
            }
        }
    )
})

apiRouter.get("/items", async (req, res) => {
    const trashed = req.query.trashed === "true" ? 1 : 0

    db.all(
        `SELECT * FROM items WHERE trashed = ${trashed} ORDER BY created_at DESC`,
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

apiRouter.delete("/items", jsonParser, (req, res) => {
    if (!validateIdsBody(req.body)) {
        return res.status(400).send()
    }

    const { ids } = req.body
    const idsPlaceholders = "?, ".repeat(ids.length).slice(0, -2)

    db.run(
        `DELETE FROM items WHERE id IN (${idsPlaceholders})`,
        ids,
        async err => {
            if (err) return res.status(500).send()

            try {
                for (const id of ids) {
                    await removeAsync(`${cdnDir}/${id}`, { force: true })
                }

                res.send()
            } catch {
                res.status(500).send()
            }
        }
    )
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
