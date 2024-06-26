import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import multer from 'multer';
import path, { dirname } from 'path';
import { fileURLToPath } from "url";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
import bcrypt from 'bcrypt';

// URL ACCESS LIMITATION

const corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    credentials: true // Allows cookies to be sent
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB DEFINITION

const db = mysql.createConnection({
    connectionLimit: 10,
    host: process.env.REACT_APP_DATABASE_HOST,
    user: process.env.REACT_APP_DATABASE_USER,
    password: process.env.REACT_APP_DATABASE_PASSWORD,
    database: process.env.REACT_APP_DATABASE_DATABASE,
});

// IMAGE DIRECTORY

app.use("/images", express.static(path.join(__dirname, 'images')))
app.use("/profileImages", express.static(path.join(__dirname, 'profileImages')))

const storage = multer.diskStorage({ 
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, "images"))
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
const profileImage = multer.diskStorage({ 
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, "profileImages"))
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
const upload = multer( { storage: storage })
const uploadProfilePicture = multer( { storage: profileImage })

// TEMP HOLD
const REACT_APP_TOKEN_KEY = 'privatekey'
// POST CHECK START
// TOKEN CREATION AND VERIFICATION
class tokenHandler {
    static checkToken = async (token) => {
        try {
            const decoded = await jwt.verify(token, REACT_APP_TOKEN_KEY)            
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    static checkTokenTime(token){
        try {
             return new Promise(( resolve, reject ) => {
                const decoded = jwt.decode(token)
                if (!decoded || !decoded.exp || !this.checkToken(token)) { 
                    resolve(0)
                }
                const currentTime = Math.floor(Date.now() / 1000);
                const remainingTime = decoded.exp - currentTime;
                console.log('Remaining time', remainingTime)
                resolve(remainingTime)
             })

        } catch (error) {
            console.log(error)
            return 0
        }
    }
    static createToken = async (userID, userName) => {
        try {
            console.log(`Creating Token for ${userID}${userName}`)
            return new Promise(( resolve, reject ) => {
                jwt.sign({ userID, userName }, REACT_APP_TOKEN_KEY, { expiresIn: "1h"}, ( err, token ) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    } else {
                        resolve(token)
                    }
                })
            })       
        } catch (error) {
            console.log(error)
            return null
        }
    }
    static async handleRefresh(userID, userName, token) {
        try {
            if (!token || !userID || !userName) return token
            console.log('Received TokenRefresh')

            const viable = await tokenHandler.checkTokenTime(token)
            console.log(viable)
            if (viable <= 300) {
                const newToken = await tokenHandler.createToken(userID, userName)
                return newToken
            } else {
                return token
            }

        } catch (error) {
            console.log('FAILURE IN TOKEN REFRESH', error)
            return token
        }
    }
}
// ENCRYPTION AND DECRYPTION
class encryptionHandler {
    static async encrypt(target){
        try {
            const response = await bcrypt.hash(target, 10)
            
            if (response) return response

        } catch (error) {
            console.log(error)
            return null
        }
    }
    static async decrypt(target, hashedTarget){
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
        const { userName, emailAddress, passWord } = req.body;
        if (!userName || !emailAddress || !passWord) {
            return res.status(422).json({ error: 'Bad request: Unprocessable Entity' });
        }
        
        // ALERT USER
        console.log('Received Registration attempt');
        
        // DEFINE SQL
        const CHECKSQL = 'SELECT * FROM USERS WHERE userName = ? OR emailAddress = ?';
        const CREATESQL = 'INSERT INTO USERS (userName, emailAddress, passWord) VALUES (?, ?, ?)';
        
        // CHECK IF USER ALREADY EXISTS
        db.execute(CHECKSQL, [userName, emailAddress], async (err, results) => {
            if (err) {
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (results.length > 0) {
                res.status(409).json({ error: 'User already exists' });
            } else {
                const hashedPassWord = await encryptionHandler.encrypt(passWord);
                db.execute(CREATESQL, [userName, emailAddress, hashedPassWord]);

                console.log('success')
                res.status(200).json({ message: 'Successfully made account' });
            }
        });
    } catch (error) {
        console.log('FAILURE IN REGISTRATION', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// LOGIN HANDLER
app.post('/api/Login', async (req, res) => {
    try {
        const { userName, emailAddress, passWord } = req.body;
        if ((!userName && !emailAddress) || !passWord) {
            console.log('Improper request payload')
            return res.status(422).json({ error: 'Bad request: Unprocessable Entity' });
        }
        
        console.log('Received login attempt', userName, emailAddress, passWord);
        
        const LOGINUSERNAMESQL = 'SELECT * FROM USERS WHERE userName = ?'
        const LOGINEMAILSQL = 'SELECT * FROM USERS WHERE emailAddress = ?';

        const query = userName ? LOGINUSERNAMESQL : LOGINEMAILSQL;
        const credentials = userName ? userName : emailAddress;

        db.execute(query, [credentials], async (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (result.length === 1) {
                const verified = await encryptionHandler.decrypt(passWord, result[0].passWord)
                const newToken = await tokenHandler.createToken(result[0].userID, result[0].userName);
                if (verified && newToken){
                    console.log('success', newToken);
                    return res.status(200).json({...result[0], token: newToken});                    
                } else {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
            } else {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    } catch (error) {
        console.log('FAILURE IN LOGIN', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// TOKEN REFRESH CALL SPECIFIC
app.post('/api/TokenRefresh', async (req, res) => {
    try {
        const {userID, userName} = req.body
        console.log('Token refresh call')
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
        console.log('Received GetPost request')

        const GETPOSTSSQL = 'SELECT * FROM POSTS'
        const USERPOSTSGETSQL = 'SELECT * FROM POSTS WHERE userID = ?'

        const query = req.body.userID ? USERPOSTSGETSQL : GETPOSTSSQL
        const credentials = req.body.userID ? req.body.userID : null

        db.execute(query, credentials, (err, results) => {
            if (err) {
                console.log(err)
                res.status(500).json({ error: "Internal Server Error"})
            } else {
                res.status(200).json( results )
            }
        })

    } catch (error) {
        console.log('FAILURE IN GET POSTS', error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})
// Specific post endpoint
// used for post component
app.post("/api/GetSpecificPost", async (req, res) => {
    try {
        console.log('Received specific post request')
        const { postID } = req.body
        const SPECIFICPOSTSQL = 'SELECT title, message, likeCount, dislikeCount FROM POSTS WHERE postID = ?'
        
        db.execute(SPECIFICPOSTSQL, [postID], (err, results) => {
            if (err) {
                res.status(500).json({ error: 'Failed to collect data'})
            } else {
                res.status(200).json({ results })
            }
        })

        
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})
// GET COMMENTS
app.post("/api/getComments", async (req, res) => {
    try {
        console.log("Received getComments request")
        const { postID } = req.body
        const GETCOMMENTSSQL = `SELECT * FROM COMMENTS WHERE postID = ?`

        db.execute(GETCOMMENTSSQL, [ postID ], (err, results) => {
            if (err) {
                console.log(err)
                res.status(500).json({ error: "Internal Server Error"})
            } else {
                res.status(200).json( results )
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
})
// CREATE COMMENT
app.post("/api/createComment", (req, res) => {
    try {
        console.log("Received create comment request")
        const {picture, postID, userID, userName, comment} = req.body    
        const CREATECOMMENTSQL = "INSERT INTO COMMENTS (picture, postID, userID, userName, comment) VALUES (?, ?, ?, ?, ?)"

        db.execute(CREATECOMMENTSQL, [picture, postID, userID, userName, comment], (err, result) => {
            if (err) {
                console.log(err)
                res.status(500).json({ error: "Internal Server Error"}) 
            } else {
                res.status(200).json({ message: 'Successfully made comment'})
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error'})
    }
    
})
// CREATE POST
app.post('/api/CreatePost', upload.single('picture'), async (req, res) => {
    try {
        console.log("Received Create post")

        const { title, message, userID, userName, tags } = req.body
        const file = req.file;
        
        if (!file){res.status(404).json({ error: 'Missing File'})}

        const token = req.headers['authorization'] || ''
        if (!token ||!tokenHandler.checkToken(token)){
            res.status(401).json({ error: 'Unauthorized'})
        } 
        const newToken = await tokenHandler.handleRefresh(userID, userName, token)

        

        if (file.mimetype != 'image/png' && file.mimetype != 'image/jpeg'){
            res.status(401).json({ error: 'Invalid filetype'})
            return
        }   
        const CREATESQL = 'INSERT INTO POSTS (title, message, Picture, userID, userName, tags, likeCount, dislikeCount) VALUES (?, ?, ?, ?, ?, ?, 0, 0)'
        const filePath = path.join('images', file.filename);
        
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
// UPDATE PROFILE
app.post('/api/UpdateProfile', uploadProfilePicture.single('picture'), async (req, res) => {
    try {
        console.log("Received update request");

        const { userID, userName, passWord, emailAddress } = req.body;
        const file = req.file;

        let dirtyToken = req.headers['authorization'];
        let token = dirtyToken.split(' ')[1]
        console.log('Token:', token);

        if (!token || !tokenHandler.checkToken(token)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const newToken = await tokenHandler.handleRefresh(userID, userName, token);

        const UPDATESQL = "UPDATE USERS SET emailAddress = ?, passWord = ?, picture = ? WHERE userID = ?";
        const hashedPassWord = await encryptionHandler.encrypt(passWord);
        const profilePicturePath = file ? path.join('profileImages', file.filename) : null;

        db.execute(UPDATESQL, [emailAddress, hashedPassWord, profilePicturePath, userID], (err, results) => {
            if (err) {
                console.error('Error updating profile:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            } else {
                return res.status(200).json({ message: 'Successfully updated profile' });
            }
        });

    } catch (error) {
        console.log('FAILURE IN UPDATE PROFILE', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// BEGIN TO LISTEN FOR REQUESTS
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})