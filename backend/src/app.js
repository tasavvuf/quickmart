const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Routes
app.get("/", (req, res) => {
  res.json({ message: "E-commerce API is running" })
})

app.use("/api", require("../routes"))

module.exports = app
