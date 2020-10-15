const mysql = require("mysql")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

exports.register = (req, res) => {
    console.log(req.body)

    const { name, email, password, passwordConfirm } = req.body;
    // console.log(name,email,password,passwordConfirm)

    let message = ""
    db.query('SELECT email from users WHERE email = ?', [email], async (error, results) => {
        
        if (error) {
            console.log(error)
        }

        if (results.length > 0) {
            return res.render('register', {
                message : "The Email is already registered"
            })
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message : "The Password does not match."
            })
        }     

        let hashedPassword = await bcrypt.hash(password, 8)
        console.log(hashedPassword)

        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword }, (error, results) => {
            if (error) {
                console.log(error)
            } else {
                console.log(results)
                return res.render('register', {
                    message : "The User Registered."
                })
            }
        })
    })
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).render('login', {
                message: "Please provide an email and password."
            })
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(results[0])
            if ( !results || !( await bcrypt.compare(password,results[0].Password)) ) {
                res.status(400).render('login', {
                    message: "Email or Password is Incorrect."
                })
            } else {
                const id = results[0].id;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.EXPIRES_IN
                })
                console.log(token)

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
                    ),
                    httpOnly : true
                }

                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect('/')
            }
        })
    } catch (error) {
        console.log(error)
    }
}