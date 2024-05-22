import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMyContext } from "../../../../../ContextProvider/ContextProvider.tsx"

interface loginData
{
    userName: string
    email: string
    passWord: string
}

export default function Login()
{
    const server = process.env.REACT_APP_SERVER_ADDRESS
    const [            
        authenticated,
        setAuthenticated,
        admin,
        setAdmin,
        userID,
        setUserID,
        userName,
        setUserName,
        email,
        setEmail, ] = useMyContext()

    const [error, setError] = useState("")
    const [newLogin, setNewLogin] = useState<loginData>({
        userName: '',
        email: '',
        passWord: ''
    })
    class AccountHandle
    {
        static handleLogin = async () => {                       
            try {
                console.log('Received')
                const response = await axios.post(`${server}/api/login`, {
                    userName: newLogin.userName,
                    passWord: newLogin.passWord,
                    emailAddress: newLogin.email
                })

                switch (response.status) {
                    case 200:
                        setError("Successfully logged in")
                        console.log(response)
                        setAuthenticated(true)
                        setUserID(response.data.userID)
                        setUserName(response.data.userName)
                        setEmail(response.data.userName)
                        break;
                    case 409:
                        setError("Bad Data")
                        break;
                    case 404:
                        setError("No Account exists")
                    default:
                        setError("Server Failure please consult admin")
                        break;
                }
            } catch (error) {  
                console.log(error)     
                setError(error.message )     
            } 
        }        
    }

    return(
        <section className="bg-gradient-to-b from-HIGHLIGHTB to-WHITE h-[80vh]">
            <div className="bg-WHITE w-[60%] h-[80%] m-auto top-10 relative rounded text-center flex flex-col justify-evenly items-center">
                <h2 className="text-[1.25rem] bg-HIGHLIGHTB text-WHITE h-[4rem] flex justify-center items-center w-[60%] rounded">
                    LOGIN
                </h2> 
                <section className="flex flex-col justify-between items-center h-[12rem]">
                    <input 
                        onChange={(e) => {
                            setNewLogin((prevData: any) => ({ ...prevData, email: e.target.value}))
                        }}
                        className="border rounded p-1" type="text" name="email" id="email" placeholder="Enter Email"
                     />
                    <input 
                        onChange={(e) => {
                            setNewLogin((prevData: any) => ({ ...prevData, userName: e.target.value}))
                        }}
                        className="border rounded p-1" type="text" name="userName" id="userName" placeholder="Enter Username"
                    />

                    <input 
                        onChange={(e) => {
                            setNewLogin((prevData: any) => ({ ...prevData, passWord: e.target.value}))
                        }}
                        className="border rounded p-1" type="text" typeof="password" name="password" id="userName" placeholder="Enter Password"
                    />
                    <button onClick={() => AccountHandle.handleLogin()} className="bg-HIGHLIGHTA text-WHITE w-[40%] rounded shadow-lg hover:opacity-90" type="button" value="Login">Login</button>
                    <p className="h-[2rem]">{error}</p>
                </section>
                <section className="p-5">
                    Want to
                    <Link className="bg-HIGHLIGHTA text-WHITE rounded p-1 ml-2 hover:opacity-90" to={'/Register'}> Register?</Link>
                </section>            
            </div>


        </section>
    )
}