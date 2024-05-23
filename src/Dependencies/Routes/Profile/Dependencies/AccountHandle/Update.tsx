import React, { useState } from "react";
import { useMyContext } from "../../../../../ContextProvider/ContextProvider.tsx";
import API from "../../../../../INTERCEPTOR/API.tsx";
import url from "url";

interface NewDetailsStruc {
    email: string;
    passWord: string;
    pictureFile: File | null;
}

export default function Update() {
    const [authenticated, setAuthenticated, admin, setAdmin, userID, setUserID, userName, setUserName, email, setEmail] = useMyContext();
    const server = process.env.REACT_APP_SERVER_ADDRESS
    const [error, setError] = useState("");
    const [newDetails, setNewDetails] = useState<NewDetailsStruc>({
        email: "",
        passWord: "",
        pictureFile: null
    });

    async function updateDetails(e) {
        e.preventDefault();         
        try {
            const formData = new FormData();
            formData.append("userID", userID.toString());
            formData.append("userName", userName);
            formData.append("emailAddress", newDetails.email);
            formData.append("passWord", newDetails.passWord);
            formData.append("picture", newDetails.pictureFile || "");

            const response = await API.post(`/api/UpdateProfile`, formData, { withCredentials: true });
            if (response.status === 200) {
                setError('Successfully updated profile');
                setNewDetails({
                    email: "",
                    passWord: "",
                    pictureFile: null
                });
            } else {
                setError("Failed to update");
            }
        } catch (error) {
            setError("Failed to update");
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
           
            <form onSubmit={updateDetails} className="flex flex-col bg-WHITE shadow-LG w-[60%] h-[50vh] m-auto justify-evenly items-center">
                <img 
                    className="rounded-full h-[10rem]"
                    src={url.resolve(`${server}`, `${sessionStorage.getItem("profilePicture")}`)} 
                    alt="You" 
                />                 
                <h2>New Password</h2>
                <input
                    className="w-[50%] h-[2rem] flex bg-HIGHLIGHTA text-WHITE text-center rounded shadow-lg"
                    type="text"
                    name="passWord"
                    value={newDetails.passWord}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                />
                <h2>New Email Address</h2>
                <input
                    className="w-[50%] h-[2rem] flex bg-HIGHLIGHTA text-WHITE text-center rounded shadow-lg"
                    type="text"
                    name="email"
                    value={newDetails.email}
                    onChange={handleInputChange}
                    placeholder="Enter new email address"
                />
                <h2>New Profile Picture</h2>
                <input
                    onChange={handleFileChange}
                    className="bg-gradient-to-r from-HIGHLIGHTB to-WHITE shadow-lg text-center h-[3rem] p-2 rounded"
                    type="file"
                    id="newpostimage"
                />
                <button 
                    className="bg-HIGHLIGHTB p-4 rounded shadow-lg text-WHITE hover:cursor-pointer hover:scale-[1.10]"
                    type="submit"
                >
                    Submit new details
                </button>
                <p>{error}</p>
            </form>
        </section>
    );
}
