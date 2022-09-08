import express, { Router } from "express"
import multer from "multer"
import sqlite3 from "sqlite3"
import { v4 as uuid } from "uuid"
import { getClientIp } from "request-ip"

import path from "path"
import fs from "fs"
import { writeFile as writeFileAsync } from "fs/promises"

import { FileJson, TextJson } from "./types/types"

const iconsDir = __dirname + "/client/public/icons"
const defaultIcon = "file"
let supportedIcons = fs.readdirSync(iconsDir).map(iconFile => iconFile.split(".")[0])

const dbPath = __dirname + "/database.db"
const cdnDir = __dirname + "/cdn"

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
            icon TEXT,
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

const upload = multer()

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

            let icon: string

            if (/(.png|.jpg|.jpeg|.gif|.svg)$/.test(id))
                icon = ""
            else {
                const i = id.lastIndexOf(".")

                if (i < 0 || i + 1 == id.length)
                    icon = defaultIcon
                else {
                    const ext = id.substring(i + 1)
                    if (supportedIcons.includes(ext))
                        icon = ext
                    else
                        icon = defaultIcon
                }
            }

            try {
                await writeFileAsync(`${cdnDir}/${id}`, file.buffer)

                newDbItems.push({
                    is_file: 1,
                    id,
                    title: file.originalname,
                    ip,
                    icon,
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
            `INSERT INTO items(is_file, id, title, ip, icon, text) VALUES ${paramsPlaceholders}`,
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
        title: "",
        ip: getClientIp(req) || "unknown",
        icon: "",
        text: req.body.text,
        created_at: new Date()
    }

    let params = Object.values(newItem)
    // remove created_at
    params.splice(-1)

    db.run(
        `INSERT INTO items(is_file, id, title, ip, icon, text) VALUES (?, ?, ?, ?, ?, ?)`,
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
    db.run(
        "DELETE FROM items WHERE id = ?",
        [req.params.id],
        err => {
            if (err) return res.status(500).send()
            res.send()
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
    const ext = path.extname(req.params.file).substring(1)
    const file = supportedIcons.includes(ext) ? ext : defaultIcon
    res.sendFile(`${iconsDir}/${file}.png`)
})

// React App
app.use(express.static(__dirname + "/client/build"))

app.get("/*", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html")
})
