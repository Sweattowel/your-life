import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import url from 'url'
import { useMyContext } from "../../../ContextProvider/ContextProvider.tsx";

interface commentsStruc {
    picture: string,
    postID: number,
    userID: number
    userName: string,
    comment: string,
}
interface dataStruc {
    likeCount: number,
    dislikeCount: number,
    message: string
    title: string
}
export default function Post() {
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

    const params = useParams();
    const navigate = useNavigate()
    
    const [data, setData] = useState<dataStruc>({
        likeCount: 0,
        dislikeCount: 0,
        message: "",
        title: ""
    })
    const [comments, setComments ] = useState<commentsStruc[]>([]);
    const commentsPerPage = 10;
    const currentPage = parseInt(params.page as string, 10) || 1;
    const [newComment, setNewComment] = useState("")
     
    const [page, setPage] = useState(currentPage);

    const startIndex = (page - 1) * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    const displayComments = comments.slice(startIndex, endIndex);

    const totalPages = Math.ceil(comments.length / commentsPerPage);

    class handlePagination
    {
        static handlePrevPage = () => {
            const newPage = Math.max(1, page - 1);
            setPage(newPage);
            navigate(`/posts/user/${params.userID}/userName/${params.userName}/postID/${params.postID}/picture/${encodeURIComponent(`${params.picture}`)}/page/${newPage}`);
            
        };

        static handleNextPage = () => {
            const newPage = Math.min(totalPages, page + 1);
            setPage(newPage);
            navigate(`/posts/user/${params.userID}/userName/${params.userName}/postID/${params.postID}/picture/${encodeURIComponent(`${params.picture}`)}/page/${newPage}`);
        };        
        static handleMaxPage = () => {
            const newPage = totalPages;
            setPage(newPage);
            navigate(`/posts/user/${params.userID}/userName/${params.userName}/postID/${params.postID}/picture/${encodeURIComponent(`${params.picture}`)}/page/${newPage}`);
        };        
    }
    class handlePost {
        static async getData() {
            try {
                const response = await axios.post(`${server}/api/GetSpecificPost`, {postID: params.postID})

                if (response.status === 200) {
                    setData(response.data)
                }
            } catch (error) {
                
            }
        }
        static async getComments(postIDString: string, wantedOffSet: number) {
            try {
                const postID = parseInt(postIDString)
                const response = await axios.post(`${server}/api/getComments`, {postID: postID, amount: 10, offSet: Math.max(0, wantedOffSet)})
                if (response.status === 200) {
                    setComments(response.data)
                    console.log(response.data)
                } else {
                    setComments([])
                }
            } catch (error) {
                setComments([])
            }
        }
        static async createComment() {
            try {
                const picture = sessionStorage.getItem("profilePicture")
                const response = await axios.post(`${server}/api/createComment`, { picture: picture, postID: params.postID, userID: userID, userName: userName, comment: newComment })
                if (response.status === 200) {
                    setNewComment('')
                    handlePost.getComments(params.postID!, (page - 1) * 10);
                    handlePagination.handleMaxPage()
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
    useEffect(() => {
        //handlePost.getData(params.postID!)
        handlePost.getComments(params.postID!, (page) * 10);

    }, [])
    useEffect(() => {
        handlePost.getComments(params.postID!, (page) * 10);

    }, [page])
    return (
        <section className="w-full h-full flex flex-col items-center bg-HIGHLIGHTB">
            <div className=" w-[90%] h-full pb-2 mt-10 m-auto bg-WHITE shadow-lg">
                <h2 className="text-BLACK bg-WHITE mt-4 w-[60%] m-auto shadow-lg text-center text-[1.5rem]">
                    {data.title}
                </h2>
                <p className="text-center min-h-[10rem] border rounded-lg">
                    { data.message || "Failed to acquire" }
                </p>
                <img 
                    className="w-full m-auto mt-5 shadow-lg"
                    src={url.resolve(server, `${params.picture}`) } 
                    alt="post" 
                />
                <Link className="text-HIGHLIGHTB hover:border-b" to={'/t esting'}>by {params.userName}</Link>
            </div>
            <section className="w-[90%] shadow-lg flex flex-col bg-WHITE">
                {displayComments.map((comment, index) => (
                    <div key={index} className="h-[6rem] flex w-[70%] p-2 ml-[10%] shadow-lg">
                        <img 
                            className="h-full rounded-full w-[6rem] bg-HIGHLIGHTA" 
                            src={url.resolve(server, `${comment.picture}`)} 
                        />
                        <div className="h-[80%] m-auto l ml-5 bg-WHITE min-w-[20%] rounded-lg">
                            <h5 className="font-bold ml-[10%]">
                                {comment.userName}
                            </h5>
                            <p className="ml-[10%]">
                                {comment.comment}
                            </p>                                
                        </div>
                    </div>
                ))}
                <section className="flex flex-row w-full h-[10rem] shadow-lg items-center">
                    {authenticated && 
                        <form className="justify-evenly w-full h-full flex flex-col items-center">
                            <input onChange={(e) => setNewComment(e.target.value)} className="shadow-lg rounded w-[80%] h-[8 0%]" placeholder="Enter comment" type="text" name="commentText" id="textInput" />
                            <input onClick={() => handlePost.createComment()} className="border border-BLACK rounded shadow-lg bg-HIGHLIGHTB text-WHITE w-[10rem]" type="button" value="submitComment" />
                        </form>
                    }
                </section>
                <div className="flex justify-between mt-4 p-1">
                    <button className="hover:font-bold hover:cursor-pointer" onClick={handlePagination.handlePrevPage} disabled={page === 1}>Previous</button>
                    <span>{page} / {Math.max(1, totalPages)}</span>
                    <button className="hover:font-bold hover:cursor-pointer" onClick={handlePagination.handleNextPage} disabled={page === totalPages}>Next</button>
                </div>
            </section>
        </section>
    );
}
