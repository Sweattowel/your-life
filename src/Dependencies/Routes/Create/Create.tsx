import axios from "axios";
import React, { useState } from "react";
import { useMyContext } from "../../../ContextProvider/ContextProvider.tsx";
import API from "../../../INTERCEPTOR/API.tsx";


interface item
{
    title: string,
    message: string,
    pictureFile: File | null,
    userName: string,
    userID: number,
}
export default function Create()
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

        
    const [item, setItem] = useState<item>({                   
        title: "",
        message: "",
        pictureFile: null,
        userName: "",
        userID: -1,
    });


    const createPost = async () =>
    {
        if (item.pictureFile === null){
            return
        }
        const formData = new FormData();
        
        formData.append("title", item.title);
        formData.append("message", item.message);
        // TODO dont forget to convert this back in the back end or account for the string
        formData.append("userID", userID.toString()); 
        formData.append("userName", userName); 
        formData.append("picture", item.pictureFile);
        formData.append("tags", 'Test,Tag,Test');

        const response = await API.post(`${server}/api/createPost`, formData)
        
        switch (response.status) {
            case 200:
                console.log('Success')
                break;
            case 500:
                console.log('UNAUTHORIZED')
                break;
            default:
                console.log('Epic fail')
                break;
        }
    }

    const handleInputChange = (e) =>
    {
        const { name, value } = e.target;
        setItem((prevItem) => ({
            ...prevItem,
            [name]: value,
        }));
    };

    const handleFileChange = (e) =>
    {
        const file = e.target.files && e.target.files[0];
        setItem((prevItem) => ({
            ...prevItem,
            pictureFile: file,
        }));
    };

    return (
        <section className="bg-gradient-to-br from-HIGHLIGHTB to-WHITE text-WHITE ml-[18vw] mt-[5vh] w-[80vw] h-[90vh] shadow-lg">
            <h1 className="w-full text-center text-[1.5rem]">
                Create BlogPost
            </h1>
            <section className="flex flex-col w-[60%] h-[50vh] justify-evenly items-center m-auto bg-WHITE text-BLACK">
                <h2>
                    Please enter Title
                </h2>
                <input 
                     value={item.title}
                     onChange={handleInputChange}
                     name="title"
                     className="bg-gradient-to-r from-HIGHLIGHTB to-WHITE shadow-lg text-center h-[2rem] rounded"
                     type="text"
                     placeholder="post title"
                />
                <h2>
                    Please enter message
                </h2>
                <textarea
                    value={item.message}
                    onChange={handleInputChange}
                    name="message"
                    className="bg-gradient-to-r from-HIGHLIGHTB to-WHITE shadow-lg text-center h-[10rem] rounded w-[80%]"
                    placeholder="post message"
                />
                <h2>
                    Upload Image
                </h2>
                <input 
                    onChange={handleFileChange}
                    className="bg-gradient-to-r from-HIGHLIGHTB to-WHITE shadow-lg text-center h-[3rem] p-2 rounded" 
                    type="file" 
                    id="newpostimage" 
                />
                <input 
                    onClick={createPost}
                    className="ring w-[40%] rounded bg-HIGHLIGHTB text-WHITE hover:opacity-90 hover:cursor-pointer hover:scale-[1.1] transition duration-5000" 
                    type="button" 
                    value="upload" 
                />
            </section>

        </section>
    )
}