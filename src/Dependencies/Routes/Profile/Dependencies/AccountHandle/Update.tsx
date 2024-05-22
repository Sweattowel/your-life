import React, {useState} from "react"
import axios from "axios"
import { useMyContext } from "../../../../../ContextProvider/ContextProvider.tsx"
import API from "../../../../../INTERCEPTOR/API.tsx"

interface newDetailsStruc {
    email: string,
    passWord: string,
    pictureFile: File | null
}

export default function Update() {
    const server = `${process.env.REACT_APP_SERVER_ADDRESS}`
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
    const [newDetails, setNewDetails] = useState<newDetailsStruc>({
        email: "",
        passWord: "",
        pictureFile: null
    })
    async function updateDetails(){
        try {
            const formData = new FormData()
            
            formData.append("userID", userID)
            formData.append("userName", userName)
            formData.append("email", newDetails.email)
            formData.append("passWord", newDetails.passWord  )
            formData.append("picture", newDetails.pictureFile || "")
            
            const response = await API.post(`${server}/api/UpdateProfile`, formData,)
            if (response.status === 200) {
                setError('Successfully updated profile')
                setNewDetails({
                    email: "",
                    passWord: "",
                    pictureFile: null
                })
            } else {
                setError("Failed to update")
            }
        } catch (error) {
            setError("Failed to update")
        }
    }
    const handleFileChange = (e) => {
            const file = e.target.files && e.target.files[0];
            setNewDetails((prevItem) => ({
                ...prevItem,
                pictureFile: file,
            }));
    };
        
    const handleInputChange = (e) => {
            const { name, value } = e.target;
            setNewDetails((prevItem) => ({
                ...prevItem,
                [name]: value,
            }));
    };
    return (
        <section className="w-full h-[100vh] bg-HIGHLIGHTB">
            <h1 className="ml-[10vw] bg-HIGHLIGHTA w-[90vw] text-WHITE text-center text-[3rem] shadow-lg">
                    Update Profile
            </h1>
            <form className="flex flex-col bg-WHITE shadow-LG w-[60%] h-[50vh] m-auto justify-evenly items-center"> 
                <h2>
                    New Password    
                </h2>               
                <input className="w-[50%] flex" type="text" placeholder="Enter new password" />
                <h2>
                    New Emailaddress
                </h2>
                <input className="w-[50%] flex" type="text" placeholder="Enter new emailAddress" />
                <h2>
                    New Profile Picture
                </h2>
                <input 
                    onChange={handleFileChange}
                    className="bg-gradient-to-r from-HIGHLIGHTB to-WHITE shadow-lg text-center h-[3rem] p-2 rounded" 
                    type="file" 
                    id="newpostimage" 
                />
                <button onClick={() => updateDetails()}>Submit new details</button>
                <p>
                    {error}
                </p>
            </form>
        </section>
    )
}