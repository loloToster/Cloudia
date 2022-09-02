const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = function (app) {
    const middleware = createProxyMiddleware({
        target: "http://localhost:3001",
        changeOrigin: true
    })

    app.use("/api", middleware)
    app.use("/cdn", middleware)
    app.use("/icon", middleware)
}
