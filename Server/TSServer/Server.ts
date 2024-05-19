const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require('multer')
const path = require('path')
const dirname = require('path')
const fileURLToPath = require("url")
const jwt = require('jsonwebtoken')

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const REACT_APP_TOKEN_KEY: string = 'privatekey'
// POST CHECK START
// TOKEN CREATION AND VERIFICATION
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
    static checkTokenTime(token: string){
        try {
            // MINIMUM IS 300 seconds as 5 minutes
            const decoded = jwt.decode(token)
            if (!decoded || !decoded.exp || !this.checkToken(token)) return 0
            
            const currentTime = Math.floor(Date.now() / 1000);
            const remainingTime = decoded.exp - currentTime;

            return remainingTime

        } catch (error) {
            return 0
        }
    }
    static createToken = async (userID: number, userName: string) => {
        try {
            jwt.sign({ userID, userName }, REACT_APP_TOKEN_KEY, { expiresIn: '1h'}, (err, token) => {
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
    static async handleRefresh(userID: number, userName: string, token: string) {
        try {
            // DEFINE AND CHECK IF DATA IS PRESENT IN REQ BODY
            if (!token || !userID || !userName) return token
            // ALERT USER
            console.log('Received TokenRefresh')
            // CHECK TOKEN IS VIABLE
            const viable = await tokenHandler.checkTokenTime(token)
            if (viable <= 300) {
                const newToken = await tokenHandler.createToken(userID, userName)
                return newToken
            }
            return token
        } catch (error) {
            console.log('FAILURE IN TOKEN REFRESH', error)
            return token
        }
    }
}
// ENCRYPTION AND DECRYPTION
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
// REGISTRATION
app.post('/api/Register', async (req, res) => {
    try {
        // DEFINE AND CHECK IF DATA IS PRESENT IN REQ BODY
        const { userName, emailAddress, passWord } = req.body
        if (!userName || !emailAddress || !passWord) res.status(422).json({ error: 'Bad request: Unprocessable Entity'})
        // ALERT USER
        console.log('Received Registration attempt')
        // DEFINE SQL
        const CHECKSQL = 'SELECT COUNT(*) as count FROM USERS WHERE userName = ? OR emailAddress = ?'
        const CREATESQL = 'INSERT INTO USERS (userName, emailAddress, passWord) VALUES (?, ?, ?)'
        // CANT USE LENGTH SO WE USE SQL COUNT CALL TO GET RESULTS
        const prevUsers = await db.query(CHECKSQL, [userName, emailAddress]);
        const prevUsersCount = prevUsers[0].COUNT
        // ENSURE NO USERS WITH THE NAME/EMAIL ALREADY EXIST
        if (prevUsersCount === 0){
            // HASH PASSWORD BEFORE STORING
            const hashedPassWord = await encryptionHandler.encrypt(passWord)
            await db.execute(CREATESQL, [userName, emailAddress, hashedPassWord]);
            // SUCCESS
            res.status(200).json({ message: 'Successfully made account'})
        } else {
            res.status(409).json({ error: 'User already exists'})
        }

    } catch (error) {
        console.log('FAILURE IN REGISTRATION', error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})
// LOGIN HANDLER
app.post('/api/Login', async ( req, res ) => {
    try {
        // DEFINE AND CHECK IF DATA IS PRESENT IN REQ BODY
        const { userName, emailAddress, passWord } = req.body
        if (!userName && !emailAddress || !passWord) res.status(422).json({ error: 'Bad request: Unprocessable Entity'})
        // ALERT USER
        console.log('Received login attempt')
        // DEFINE SQL
        const LOGINUSERNAMESQL = 'SELECT * FROM USERS WHERE userName = ? AND passWord = ?'
        const LOGINEMAILSQL = 'SELECT * FROM USERS WHERE emailAddress = ? AND passWord = ?'
        // CHOOSE QUERY BASED ON REQ BODY

        // WHY ? i want to be able to log in using either the userName or the Email as provided by the user

        const query = userName ? LOGINUSERNAMESQL : LOGINEMAILSQL
        const credentials = userName ? [userName, passWord] : [emailAddress, passWord]
        
        db.execute(query, credentials, async (err, queryResult) => {
            if (err || queryResult[1]) {
                console.log(err)
                res.status(500).json("Internal Server Error")
            } else {
                const newToken = await tokenHandler.createToken(queryResult[0].userID, queryResult[0].userName)
                const data = {userID: queryResult[0].userID, emailAddress: queryResult[0].emailAddress, userName: queryResult[0].userName, token : newToken}
                res.status(200).json({ data: data })
            }
        })
    } catch (error) {
        console.log('FAILURE IN LOGIN', error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})
// TOKEN REFRESH CALL SPECIFIC
app.post('/api/TokenRefresh', async (req, res) => {
    try {
        const {userID, userName} = req.body

        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        }
        const token = authHeader.split(' ')[1];
        const newToken = await tokenHandler.handleRefresh(userID, userName, token)

        res.status(200).json({ token: newToken})

    } catch (error) {
        console.log('FAILURE IN TokenRefreshCall', error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})
// POST HANDLER
app.post('/api/GetPosts', async (req, res) => {
    try {
        const GETPOSTSSQL = 'SELECT * FROM POSTS'
        const SPECIFICGETPOSTSQL = 'SELECT * FROM POSTS WHERE userID = ?'

        const query = req.body.userID ? GETPOSTSSQL : SPECIFICGETPOSTSQL
        const credentials = req.body.userID ? req.body.userID : null

        db.execute(query, credentials, (err, results) => {
            if (err) {
                console.log(err)
                res.status(500).json({ error: "Internal Server Error"})
            } else {
                res.status(200).json({ data: results})
            }
        })

    } catch (error) {
        console.log('FAILURE IN GET POSTS', error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})
interface MulterFile {
    path: string,
    filename: string,
    mimetype: string,
    size: number
}
app.post('/api/CreatePost', upload.single('picture'), async (req, res) => {
    try {
        console.log("Received Create post")

        const { title, message, userID, userName, tags } = req.body
        const file: MulterFile = req.file as MulterFile;
        
        if (!file){res.status(404).json({ error: 'Missing File'})}

        const token: string = req.headers['authorization'] || ''
        if (!token ||!tokenHandler.checkToken(token)){
            res.status(401).json({ error: 'Unauthorized'})
        } 
        const newToken = await tokenHandler.handleRefresh(userID, userName, token)

        

        if (file.mimetype != 'image/png' && file.mimetype != 'image/jpeg'){
            res.status(401).json({ error: 'Invalid filetype'})
            return
        }   
        const CREATESQL = 'INSERT INTO POSTS (title, message, Picture, userID, userName, tags) VALUES (?, ?, ?, ?, ?, ?)'
        const filePath = path.resolve(__dirname, file.filename);
        
        db.execute(CREATESQL, [ title, message, filePath, userID, userName, tags ], (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Failed to create post'})
            } else {
                res.status(200).json({ message: 'Successfully made post', token: newToken})
            }
            
        })
        
    } catch (error) {
        console.log('FAILURE IN CREATE POST', error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})

app.post('/api/UpdateProfile', upload.single('picture'), async (req, res) => {
    try {
        console.log("Received update request")

        const { userID, userName, passWord, emailAddress } = req.body
        const file: MulterFile = req.file as MulterFile

        const token: string = req.headers['authorization'] || ''
        if (!token ||!tokenHandler.checkToken(token)){
            res.status(401).json({ error: 'Unauthorized'})
        } 
        const newToken = await tokenHandler.handleRefresh(userID, userName, token)
        
        const UPDATESQL = "UPDATE USERS WHERE userID = ? SET emailAddress, passWord, profilePicture VALUES (?, ?, ?)"
        const hashedPassWord = await encryptionHandler.encrypt(passWord)
        const profilePicturePath = file ? path.resolve(__dirname, file.filename) : null;

        db.execute(UPDATESQL, [emailAddress, hashedPassWord, profilePicturePath])
        res.status(200).json({ message: 'Successfully updated profile', token: newToken})
    } catch (error) {
        console.log('FAILURE IN UPDATE PROFILE', error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})
// BEGIN TO LISTEN FOR REQUESTS
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})