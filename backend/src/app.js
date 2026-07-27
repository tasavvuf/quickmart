const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("../config/swagger")

const app = express()

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.get("/", (req, res) => {
  res.json({ message: "E-commerce API is running" })
})

app.use("/api", require("../routes"))

module.exports = app
