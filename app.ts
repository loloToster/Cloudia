import express, { Router } from "express"

const PORT = 3001
const app = express()

// API
const apiRouter = Router()

apiRouter.get("/", (req, res) => {
    res.send("hello!")
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
