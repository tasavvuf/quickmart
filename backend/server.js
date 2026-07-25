const path = require("path")
const dotenv = require("dotenv")
const app = require("./src/app")
const connectDB = require("./config/db")

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") })

// Connect to database
connectDB()
  .catch((error) => {
    console.error("database connection failed:", error.message)
    process.exit(1)
  })

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - http://localhost:${PORT}`)
})
