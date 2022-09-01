import express, { Router } from "express"
import multer from "multer"
import { JsonDB, Config } from "node-json-db"
import { v4 as uuid } from "uuid"

import path from "path"
import fs from "fs"

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

apiRouter.post("/image", upload.single("image"), async (req, res) => {
    const body = {
        title: req.body.title,
        user: req.body.username,
        file: req.file
    }

    if (!body.title || !body.user || !body.file)
        return res.status(400).send()

    const id = uuid()
    const fileName = id + path.extname(body.file.originalname)

    fs.writeFile(
        `${cdnDir}/${fileName}`,
        body.file.buffer,
        async err => {
            if (err) return console.error(err)

            await db.push("/images[]", {
                id, title: body.title, user: body.user, file: fileName
            })
        }
    )

    res.send()
})

apiRouter.get("/images", async (req, res) => {
    res.json(await db.getData("/images"))
})

apiRouter.get("/image/:id", async (req, res) => {
    res.json(await db.find("/images", img => img.id == req.params.id))
})

apiRouter.delete("/image/:id", async (req, res) => {
    const index = await db.getIndex("/images", req.params.id)
    if (index < 0) return res.status(404).send()

    await db.delete(`/images[${index}]`)

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
