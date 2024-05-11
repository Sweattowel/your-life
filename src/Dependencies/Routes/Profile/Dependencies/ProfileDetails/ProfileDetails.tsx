import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";



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
    const server = process.env.REACT_APP_SERVER_ADDRESS
    const params = useParams();

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
        handlePosts.getPosts;
    },[])
    
    return(
        <section className="bg-gradient-to-r from-HIGHLIGHTB to-HIGHLIGHTA w-[90vw] h-[100vh]">
            <div className="bg-WHITE h-[10rem] flex justify-evenly items-center">
                <h1 className="text-[1.5rem] bg-HIGHLIGHTA text-WHITE p-5 rounded">
                    Earl Jacob Jones
                </h1>
                <img className="rounded-full h-[8rem] shadow-lg" src="https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg" alt="You" />
                {posts.length > 0 && posts.map((post, index) => (
                    <div key={index}>
                        {post.title}
                    </div>
                ))}
            </div>

        </section>
    )
}