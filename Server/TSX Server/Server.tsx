import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import { createRequire } from "module";
import multer from "multer";
import path, { resolve } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import jwt from 'jsonwebtoken'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const bcrypt = require('bcrypt')

// URL ACCESS LIMITATION

const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// DB DEFINITION

const db = mysql.createConnection({
    connectionLimit: 10,
    host: process.env.REACT_APP_DATABASE_HOST,
    user: process.env.REACT_APP_DATABASE_USER,
    password: process.env.REACT_APP_DATABASE_PASSWORD,
    database: process.env.REACT_APP_DATABASE_DATABASE,
});

app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

// IMAGE DIRECTORY

app.use("/images", express.static(path.join(__dirname, 'images')))

const storage = multer.diskStorage({ 
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, "images"))
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer( { storage: storage })
// TEMP HOLD
const REACT_APP_TOKEN_KEY = 'privatekey'
// POST CHECK START

class tokenHandler {
    static checkToken = async (token: string) => {
        try {
            const decoded = await jwt.verify(token, REACT_APP_TOKEN_KEY)            
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    static createToken = async (userID: number, userName: string) => {
        try {
            jwt.sign({ userID, userName }, REACT_APP_TOKEN_KEY, { expiresIn: '1h'}, (err: any, token: string) => {
                if (err) {
                    console.log(err)
                    return null
                } else {
                    return token
                }
            })            
        } catch (error) {
            console.log(error)
            return null
        }
    }
}
class encryptionHandler {
    static async encrypt(target: string){
        try {
            const response = await bcrypt.hash(target, 10)
            
            if (response) return response

        } catch (error) {
            console.log(error)
            return null
        }
    }
    static async decrypt(target: string, hashedTarget: string){
        try {
            const check = await bcrypt.compare(target, hashedTarget)
            
            if (check) return true
            
        } catch (error) {
            console.log(error)
            return false
        }
    }
}
app.post('/api/Register', async (req, res) => {
    try {
        const { userName, emailAddress, passWord } = req.body
        if (!userName || !emailAddress || !passWord) res.status(422).json({ error: 'Bad request: Unprocessable Entity'})
        
        console.log('Received login attempt')

        const CHECKSQL = 'SELECT * FROM USERS WHERE userName = ?'
        const CREATESQL = 'INSERT INTO USERS (userName, emailAddress, passWord) VALUES (?, ?, ?)'
        const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await db.execute(CHECKSQL, [userName]);

        if (rows.length === 0){
            const hashedPassWord = await encryptionHandler.encrypt(passWord)
            await db.execute(CREATESQL, [userName, emailAddress, hashedPassWord]);
            res.status(200).json({ message: 'Successfully made account'})
        } else {
            res.status(409).json({ error: 'User already exists'})
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})