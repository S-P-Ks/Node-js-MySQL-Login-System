const express = require("express")
const mysql = require("mysql")
const path = require("path")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv")

dotenv.config({ path: "./.env" })

const app = express()

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

app.use(express.static(path.join(__dirname, "./Public")))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

app.set('view engine', 'hbs')

db.connect((error) => {
    if (error) {
        console.log("ERROR")
    } else {
        console.log("MySql Connection Completed...")
    }
})

app.use("/", require("./routes/pages"))
app.use("/auth",require("./routes/auth"))

app.listen(5000, () => {
    console.log("Server Started on port 5000")
})