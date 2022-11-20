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

const iconsDir = __dirname + "/node_modules/vscode-icons/icons"

const dbPath = __dirname + "/database.db"
const tmpFileDir = __dirname + "/tmp"
const cdnDir = __dirname + "/cdn"

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
            is_file INT,
            id TEXT,
            title TEXT,
            ip TEXT,
            is_img INT,
            text TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    )

    app.listen(PORT, () => {
        console.log("Listening on port", PORT)
    })
})

// API
const apiRouter = Router()

const upload = multer({ dest: __dirname + "/tmp" })

apiRouter.get("/", (req, res) => {
    res.send("hello!")
})

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
                    is_file: 1,
                    id,
                    title: file.originalname,
                    ip,
                    is_img: /(.png|.jpg|.jpeg|.gif|.svg)$/.test(id) ? 1 : 0,
                    text: "",
                    created_at: new Date()
                })
            } catch (err) {
                console.error(err)
            }
        }

        const paramsPlaceholders = newDbItems.map(() => "(?, ?, ?, ?, ?, ?)").join(", ")
        const params = newDbItems.map(item => {
            let parsedItem = Object.values(item)
            // remove created_at
            parsedItem.splice(-1)
            return parsedItem
        }).flat()

        db.run(
            `INSERT INTO items(is_file, id, title, ip, is_img, text) VALUES ${paramsPlaceholders}`,
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

apiRouter.post("/text", express.json(), async (req, res) => {
    if (typeof req.body.text !== "string")
        return res.status(400).send()

    const newItem: TextJson = {
        is_file: 0,
        id: uuid(),
        title: req.body.title || "",
        ip: getClientIp(req) || "unknown",
        is_img: 0,
        text: req.body.text,
        created_at: new Date()
    }

    let params = Object.values(newItem)
    // remove created_at
    params.splice(-1)

    db.run(
        `INSERT INTO items(is_file, id, title, ip, is_img, text) VALUES (?, ?, ?, ?, ?, ?)`,
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
    db.all(
        "SELECT * FROM items ORDER BY created_at DESC",
        (err, rows) => {
            if (err) return res.status(500).send()
            res.send(rows)
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
    res.sendFile(`${iconsDir}/${getIconForFile(fileName)}`)
})

// React App
app.use(express.static(__dirname + "/client/build"))

app.get("/*", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html")
})
