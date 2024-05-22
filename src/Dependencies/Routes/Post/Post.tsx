import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import url from 'url'

interface commentsStruc {
    picture: string,
    userNAME: string,
    comment: string,
}
export default function Post() {
    const server = `${process.env.REACT_APP_SERVER_ADDRESS}`
    const params = useParams();
    const navigate = useNavigate()
    const [comments, setComments ] = useState<commentsStruc[]>([]);
    const commentsPerPage = 2;
    const currentPage = parseInt(params.page as string, 10) || 1;
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
    }
    class handlePost {
        static getData(ID: string) {
            try {
                
            } catch (error) {
                console.log(error)
            }
        }
        static async getComments(postIDString: string, wantedOffSet) {
            try {
                const postID = parseInt(postIDString)
                const response = await axios.post(`${server}/api/getComments`, {postID: postID, amount: 10, offSet: wantedOffSet})
                if (response.status === 200) {
                    if (comments.length > 0) {
                        setComments((prevComments) => [
                            ...prevComments, response.data
                        ])
                    } else {
                        setComments(response.data)
                    }
                } else {
                    setComments([])
                }
            } catch (error) {
                setComments([])
            }
        }
    }
    useEffect(() => {
        handlePost.getData(params.postID!)
        handlePost.getComments(params.postID!, (page - 1) * 10);

    }, [])
    useEffect(() => {
        handlePost.getComments(params.postID!, (page - 1) * 10);

    }, [page])
    return (
        <section className="ml-[10vw] w-[89vw] h-full flex flex-col items-center ">
            <div className="bg-HIGHLIGHTA w-[90%] h-[90vh] mt-10 m-auto border">
                <h2 className="text-BLACK bg-WHITE mt-4 w-[60%] m-auto shadow-lg text-center text-[1.5rem]">
                    Post {params.postID} by {params.userName}
                </h2>
                <img 
                    className="max-w-[80%] m-auto mt-5 shadow-lg"
                    src={url.resolve(server, `${params.picture}`) } 
                    alt="post" 
                />
            </div>
            <section className="divide-y w-[90%] shadow-lg mb-10">
                {displayComments.map((comment, index) => (
                    <div key={index} className="h-[6rem] flex w-full">
                        <img className="h-full rounded-full" src={comment.picture} alt={comment.comment} />
                        <div className="ml-5">
                            <h5 className="font-bold">
                                {comment.userNAME}
                            </h5>
                            <p>
                                {comment.comment}
                            </p>                                
                        </div>
                    </div>
                ))}
                <div className="flex justify-between mt-4 p-1">
                    <button className="hover:font-bold hover:cursor-pointer" onClick={handlePagination.handlePrevPage} disabled={page === 1}>Previous</button>
                    <span>{page} / {Math.max(1, totalPages)}</span>
                    <button className="hover:font-bold hover:cursor-pointer" onClick={handlePagination.handleNextPage} disabled={page === totalPages}>Next</button>
                </div>
            </section>
        </section>
    );
}
