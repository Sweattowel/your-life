import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useMyContext } from "../../../ContextProvider/ContextProvider.tsx";
import url from "url";

interface postStructure {
    title: string,
    userNAME: string,
    message: string,
    picture: string,
    userID: number,
    postID: number,
    likeCount: number,
    dislikeCount: number,
    comments: any[]
}
interface commentsStruc {
    picture: string,
    userNAME: string,
    comment: string,
}
export default function Home()
{
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
        
    const [wantCommentID, setWantCommentID] = useState(-1)
    const [displayComments, setDisplayComments] = useState<commentsStruc[]>([])
    const [posts, setPosts] = useState<postStructure[]>([])
    

    class handlePosts
    {
        static async getPosts() {
            try {
                const response = await axios.post(`${server}/api/GetPosts`, { UserID: null })

                switch (response.status) {
                    case 200:
                        console.log(response.data)
                        setPosts(response.data)
                        sessionStorage.setItem("posts", JSON.stringify(response.data))
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
        static async getComments(postID: number) {
            try {
                const response = await axios.post(`${server}/api/getComments`, {postID: postID, amount: 3, offSet: 0})
                if (response.status === 200) {
                    setDisplayComments(response.data)
                } else {
                    setDisplayComments([])
                }
            } catch (error) {
                setDisplayComments([])
            }
        }

    }

    useEffect(() => {

        let cache = sessionStorage.getItem("posts")
        let cleanCache = JSON.parse(cache!)

        if (!cleanCache || cleanCache.length === 0){
            handlePosts.getPosts();
        } else {
            setPosts(cleanCache);
        }
        
    },[])
    return(
        <section className="w-full h-full flex flex-col justify-evenly bg-HIGHLIGHTB">

            {posts && posts.length > 0 && posts.map((post, index) => (
                <div key={index} className="w-[60%] m-auto flex flex-col justify-center items-center shadow-lg mt-5 mb-5 rounded-lg bg-WHITE">
                    <div className="flex border-b text-[1.25rem] w-[80%] text-center justify-evenly items-center mt-1 rounded-t">
                        <h2>
                            {post.title} by {post.userNAME}                             
                        </h2>
                        <Link className="ml-2 text-[0.7rem] h-full rounded p-1 bg-HIGHLIGHTA hover:bg-HIGHLIGHTB text-WHITE" 
                            to={`/posts/user/${post.userID}/userName/${post.userNAME}/postID/${post.postID}/picture/${encodeURIComponent(post.picture)}/page/1`}>
                            Open Post
                        </Link>
                    </div>
                    <p className="shadow-inner h-full w-[80%] text-center mb-1 bg-WHITE rounded-b max-h-[10rem]">
                        {post.message}
                    </p>
                    
                    <img 
                        className="h-[40vh]" 
                        src={url.resolve(server, post.picture)} 
                        alt={post.title} 
                    />
                    <section className="flex justify-between w-[80%] bg-WHITE rounded m-1">
                        <button 
                            className="hover:border-b"
                            onClick={() => {
                                setWantCommentID( wantCommentID !== post.postID ? post.postID : -1)
                                handlePosts.getComments(post.postID)
                            }}
                        >
                            Comments
                        </button>
                        <div className="flex h-[3rem] items-center">
                            <img 
                                onClick={() => post.likeCount++}
                                className="h-[1rem] mr-2 hover:shadow-lg"
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw0kL8pP6YwhbvP_sZh09pk79H8yISzZWwMTFAGNIvOg&s" 
                                alt={`${post.likeCount}`} 
                            />
                            {post.likeCount}
                            <img 
                                onClick={() => post.dislikeCount++}
                                className="transform rotate-180 h-[1rem] ml-5 mr-2 hover:shadow-lg"
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw0kL8pP6YwhbvP_sZh09pk79H8yISzZWwMTFAGNIvOg&s" 
                                alt={`${post.dislikeCount}`} 
                            />
                            {post.dislikeCount}          
                            <p className="ml-5">
                                RAT: {(post.likeCount / (post.likeCount + post.dislikeCount) * 100).toFixed(0)} 
                            </p>      
                        </div>
                         
                    </section>
                    <div className="divide-y w-full duration-5000 bg-WHITE rounded-b">
                        {wantCommentID === post.postID &&
                            displayComments.map((comment, commentIndex) => (
                                <div key={commentIndex} className="shadow-inner w-full h-[5rem] flex">
                                    <img className="h-[90%] ml-4 m-auto rounded-full" src={comment.picture} alt={comment.comment} />
                                    <section className="w-full">
                                        <h5 className="text-BLACK ml-[10%] w-[25%] font-bold border-b">
                                            {comment.userNAME}
                                        </h5>
                                        <p className="text-BLACK ml-[10%]">
                                            {comment.comment}
                                        </p>                                          
                                    </section>
                                </div>
                            ))
                        } 
                        {post.comments && post.comments.length === 3 && (
                        <div className="shadow-inner w-full h-[2rem] flex justify-center items-center">
                            More on post                                          
                        </div>
                        )}                       
                    </div>
                </div>
            ))}
        </section>
    )
}