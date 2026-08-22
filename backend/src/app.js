const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("../config/swagger")

const app = express()

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed =
      origin === "https://vingo-beta-v1.vercel.app" ||
      origin.endsWith(".vercel.app") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:");
    callback(null, true); // Allow for Beta 1.0
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
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
