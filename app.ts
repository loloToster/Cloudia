import express, { Router } from "express"
import multer from "multer"

const PORT = 3001
const app = express()

// API
const apiRouter = Router()

const upload = multer()

apiRouter.get("/", (req, res) => {
    res.send("hello!")
})

apiRouter.post("/image", upload.single("image"), (req, res) => {
    console.log(req.body)
    console.log(req.file)
    res.send()
})

app.use("/api", apiRouter)

// React App
app.use(express.static(__dirname + "/client/build"))

app.get("/*", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html")
})

app.listen(PORT, () => {
    console.log("Listening on port", PORT)
})
