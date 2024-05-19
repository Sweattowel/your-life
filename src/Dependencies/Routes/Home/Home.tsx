import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useMyContext } from "../../../ContextProvider/ContextProvider.tsx";

const placeHolderPosts = [
    {
        title: 'PlaceHolder',
        message: 'First ever post Horay!',
        picture: 'https://gratisography.com/wp-content/uploads/2024/03/gratisography-funflower-800x525.jpg',
        likeCount: 2,
        dislikeCount: 1,
        comments: [
            {userPicture: "https://gratisography.com/wp-content/uploads/2024/03/gratisography-funflower-800x525.jpg", userName: 'firstCommenter', comment: 'Here i am once again'},
            {userPicture: "https://gratisography.com/wp-content/uploads/2024/03/gratisography-funflower-800x525.jpg", userName: 'JohnCommenter', comment: 'Here i am TWICE again'},
            {userPicture: "https://gratisography.com/wp-content/uploads/2024/03/gratisography-funflower-800x525.jpg", userName: 'Argentinianfellow', comment: 'You two arent funny'},
        ],
        userName: 'Jacob',
        userID: 102,
        postID: 101,
    },
    {
        title: 'Shathours',
        message: 'Just Shat myself feeling free',
        picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS1u05OPc7MSt9f5Dg2QMSbRPu_FHowIjog-jxeSwHIw&s',
        likeCount: 0,
        dislikeCount: 2038,
        comments: [
            {userPicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS1u05OPc7MSt9f5Dg2QMSbRPu_FHowIjog-jxeSwHIw&s", userName: 'firstCommenter', comment: 'gross and why??'},
            {userPicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS1u05OPc7MSt9f5Dg2QMSbRPu_FHowIjog-jxeSwHIw&s", userName: 'JohnCommenter', comment: 'Stop posting'},
        ],
        userName: 'Jeansicca',
        userID: 103,
        postID: 102,
    },
]
export default function Home()
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
        
    const [wantCommentID, setWantCommentID] = useState(-1)
    const [posts, setPosts] = useState(placeHolderPosts)
    

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

    }

    useEffect(() => {

        let cache = sessionStorage.getItem("posts")
        if (!cache || cache.length === 0){
            handlePosts.getPosts();
        }
        
    },[])
    return(
        <section className="ml-[10vw] w-[85vw] h-full flex flex-col justify-evenly">

            {posts.length > 0 && posts.map((post, index) => (
                <div key={index} className="w-[60%] m-auto flex flex-col justify-center items-center shadow-lg mt-5 mb-5 rounded-lg bg-HIGHLIGHTB">
                    <div className="flex border-b text-[1.25rem] w-[80%] text-center justify-evenly items-center bg-WHITE mt-1 rounded-t">
                        <h2>
                            {post.title} by {post.userName}                             
                        </h2>
                        <Link className="ml-2 text-[0.7rem] h-full rounded p-1 bg-HIGHLIGHTA hover:bg-HIGHLIGHTB text-WHITE" 
                            to={`/posts/user/${post.userID}/postID/${post.postID}/picture/${encodeURIComponent(post.picture)}/page/1`}>
                            Open Post
                        </Link>
                    </div>
                    <p className="shadow-inner shadow-lg h-full w-[80%] text-center mb-1 bg-WHITE rounded-b max-h-[10rem]">
                        {post.message}
                    </p>
                    
                    <img className="h-[40vh]" src={post.picture} alt={post.title} />
                    <section className="flex justify-evenly w-[40%] bg-WHITE rounded m-1">
                        <button 
                            onClick={() => setWantCommentID( wantCommentID !== post.postID ? post.postID : -1)}
                        >
                            Comments
                        </button>
                        <div className="flex h-[3rem] items-center">
                            <img 
                            onClick={() => post.likeCount++}
                            className="h-[2rem] mr-2 hover:shadow-lg"
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw0kL8pP6YwhbvP_sZh09pk79H8yISzZWwMTFAGNIvOg&s" 
                            alt={`${post.likeCount}`} 
                            />
                            {post.likeCount}
                            <img 
                            onClick={() => post.dislikeCount++}
                            className="transform rotate-180 h-[2rem] ml-5 mr-2 hover:shadow-lg"
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
                            post.comments.map((comment, commentIndex) => (
                                <div key={commentIndex} className="shadow-inner w-full h-[5rem] flex">
                                    <img className="h-[90%] ml-4 m-auto rounded-full" src={comment.userPicture} alt={comment.comment} />
                                    <section className="w-full">
                                        <h5 className="text-BLACK ml-[10%] w-[25%] font-bold border-b">
                                            {comment.userName}
                                        </h5>
                                        <p className="text-BLACK ml-[10%]">
                                            {comment.comment}
                                        </p>                                          
                                    </section>
                                  
                                </div>

                            ))
                        } 
                        {post.comments.length === 3 && (
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