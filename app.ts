import express, { Router } from "express"
import multer from "multer"
import { JsonDB, Config } from "node-json-db"
import { v4 as uuid } from "uuid"
import { getClientIp } from "request-ip"

import path from "path"
import fs from "fs"

const defaultIcon = "file"
let supportedIcons = fs.readdirSync(__dirname + "/client/public/icons")
    .map(iconFile => iconFile.split(".")[0])

const dbPath = __dirname + "/db.json"
const cdnDir = __dirname + "/cdn"

if (!fs.existsSync(cdnDir)) {
    fs.mkdirSync(cdnDir)
    if (fs.existsSync(dbPath)) fs.rmSync(dbPath)
} else if (!fs.existsSync(dbPath)) {
    fs.rmSync(cdnDir)
    fs.mkdirSync(cdnDir)
}

const db = new JsonDB(
    new Config(dbPath)
)

const PORT = 3001
const app = express()

// API
const apiRouter = Router()

const upload = multer()

apiRouter.get("/", (req, res) => {
    res.send("hello!")
})

apiRouter.post("/file", upload.single("file"), async (req, res) => {
    const ip = getClientIp(req)

    const body = {
        title: req.body.title,
        user: req.body.username,
        file: req.file
    }

    if (!body.title || !body.user || !body.file)
        return res.status(400).send()


    const id = (
        uuid() + path.extname(body.file.originalname)
    ).toLowerCase()

    fs.writeFile(
        `${cdnDir}/${id}`,
        body.file.buffer,
        async err => {
            if (err) return console.error(err)

            let icon: string | null

            if (/(.png|.jpg|.jpeg|.gif)$/.test(id))
                icon = null
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

            await db.push("/files[]", {
                id, title: body.title, user: `${body.user} (${ip})`, icon
            })
        }
    )

    res.send()
})

apiRouter.get("/files", async (req, res) => {
    res.json(await db.getData("/files"))
})

apiRouter.get("/file/:id", async (req, res) => {
    res.json(await db.find("/files", img => img.id == req.params.id))
})

apiRouter.delete("/file/:id", async (req, res) => {
    const index = await db.getIndex("/files", req.params.id)
    if (index < 0) return res.status(404).send()

    await db.delete(`/files[${index}]`)

    res.send()
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

// React App
app.use(express.static(__dirname + "/client/build"))

app.get("/*", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html")
})

app.listen(PORT, () => {
    console.log("Listening on port", PORT)
})
