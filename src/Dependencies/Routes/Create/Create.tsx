import axios from "axios";
import React, { useState } from "react";


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
    const [item, setItem] = useState<item>({
        title: "",
        message: "",
        pictureFile: null,
        userName: "",
        userID: 0,
    });


    const createPost = async () =>
    {
        if (item.pictureFile === null){
            return
        }
        const formData = new FormData();
        
        formData.append("title", item.title);
        formData.append("message", item.message);
        formData.append("userID", item.message);
        formData.append("userName", item.message);
        formData.append("Picture", item.pictureFile);

        const response = await axios.post(`${server}/api/createPost`, formData)
        switch (response.status) {
            case 200:
                console.log('Success')
                break;
            default:
                console.log('Epic fail')
                break;
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        const { name, value } = e.target;
        setItem((prevItem) => ({
            ...prevItem,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = e.target.files && e.target.files[0];
        setItem((prevItem) => ({
            ...prevItem,
            pictureFile: file,
        }));
    };

    return (
        <section className="bg-gradient-to-br from-HIGHLIGHTB to-WHITE text-WHITE ml-[15vw] mt-[5vh] w-[80vw] h-[90vh] shadow-lg">
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