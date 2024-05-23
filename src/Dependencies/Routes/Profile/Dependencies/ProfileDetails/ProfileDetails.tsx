import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMyContext } from "../../../../../ContextProvider/ContextProvider.tsx";
import url from 'url'


export default function ProfileDetails()
{
    const [posts, setPosts] = useState([
        {
            title: '',
            message: '',
            picture: '',
            likeCount: 0,
            dislikeCount: 0,
            comments: [],
            userName: '',
            userID: -1,
            postID: -1,
        }
    ])
    const server = `${process.env.REACT_APP_SERVER_ADDRESS}`
    const params = useParams();
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
        
    const [userPicture, setUserPicture] = useState("")

    class handlePosts
    {
        static async getPosts() {
            try {
                const response = await axios.post(`${server}/api/getPosts`, 
                {
                    UserID: params.userID,
                    PostID: -1
                })
                switch (response.status) {
                    case 200:
                        setPosts(response.data)
                        break;
                    case 404:
                        setPosts([])
                        console.log('No posts')
                        break;
                    default:
                        setPosts([])
                        console.log('Failed to get posts NOT EMPTY')
                        break;
                }

            } catch (error) {
                setPosts([])
                console.log('Failed to get posts NOT EMPTY')
            }            
        }

    }

    useEffect(() => {
        handlePosts.getPosts();
    },[])
    useEffect(() => {
        if (authenticated) {
            const newPicture = sessionStorage.getItem('profilePicture')
            setUserPicture(`${newPicture}`)
            console.log(`${newPicture}`)
        }
    }, [authenticated])
    return(
        <section className="flex flex-col bg-gradient-to-r from-HIGHLIGHTB to-HIGHLIGHTA w-full h-full shadow-lg">
            <div className="ml-[10vw] bg-WHITE h-[12vh] flex justify-evenly items-center">
                <h1 className="text-[1.5rem] text-center bg-HIGHLIGHTA text-WHITE p-5 rounded w-[40%]">
                    Welcome {userName}
                </h1>
                <div className="relative group w-[8rem] h-[8rem]">
                    <img 
                        className="rounded-full w-full h-full shadow-lg hover:opacity-50" 
                        src={url.resolve(`${server}`, userPicture)} 
                        alt="You" 
                    />     
                    <Link to={'/Profile/Update'} className="absolute inset-0 flex items-center justify-center text-white text-lg bg-HIGHLIGHTB bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-full hover:cursor-pointer">
                        Update profile?
                    </Link>
                </div>


            </div>
            <section className="flex flex-col ml-[10vw] mt-1 w-[80%] justify-center items-center">
                    {posts.length > 0 && posts.map((post, index) => (
                        <div key={index} className="shadow-lg rounded-lg mt-2 mb-2 bg-WHITE w-[80vw] justify-center flex flex-col items-center">
                            <div className="flex w-[60%] justify-evenly items-center border-b">
                                <h2 className="font-bold text-[2rem]">
                                    {post.title}                                     
                                </h2>
                                <Link className="ml-2 text-[0.7rem] h-full rounded p-1 bg-HIGHLIGHTA hover:bg-HIGHLIGHTB text-WHITE" 
                                    to={`/posts/user/${post.userID}/userName/${userName}/postID/${post.postID}/picture/${encodeURIComponent(post.picture)}/page/1`}>
                                    Open Post
                                </Link>                            
                            </div>
                                <img className="max-w-[30vw] h-[25vh]" src={url.resolve(`${server}`, post.picture)} alt={post.title} />
                        </div>
                    ))}                     
               
            </section>
            <footer className="bg-WHITE text-BLACK w-full">
                test
            </footer>
        </section>
    )
}