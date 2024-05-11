import React from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


export default function Post() {
    const params = useParams();
    const navigate = useNavigate()
    const comments = [
        {picture: "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg", userName: "This project will take a while", comment: "test"},
        {picture: "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg", userName: "dipsnit", comment: "ehhhh"},
        {picture: "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg", userName: "dipshit", comment: "GHarbhae"}
    ];
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
            navigate(`/posts/user/${params.userID}/postID/${params.postID}/picture/${encodeURIComponent(`${params.picture}`)}/page/${newPage}`);
            
        };

        static handleNextPage = () => {
            const newPage = Math.min(totalPages, page + 1);
            setPage(newPage);
            navigate(`/posts/user/${params.userID}/postID/${params.postID}/picture/${encodeURIComponent(`${params.picture}`)}/page/${newPage}`);
        };        
    }


    return (
        <section className="ml-[10vw] w-[89vw] h-full flex flex-col items-center ">
            <div className="bg-HIGHLIGHTA w-[90%] h-[90vh] mt-10 m-auto border">
                <h2 className="text-BLACK bg-WHITE mt-4 w-[60%] m-auto shadow-lg text-center text-[1.5rem]">
                    Post {params.postID} by {params.userID}
                </h2>
                <img 
                    className="max-w-[80%] m-auto mt-5 shadow-lg"
                    src={params.picture} 
                    alt="post" 
                />
            </div>
            <section className="divide-y w-[90%] shadow-lg mb-10">
                {displayComments.map((comment, index) => (
                    <div key={index} className="h-[6rem] flex w-full">
                        <img className="h-full rounded-full" src={comment.picture} alt={comment.comment} />
                        <div className="ml-5">
                            <h5 className="font-bold">
                                {comment.userName}
                            </h5>
                            <p>
                                {comment.comment}
                            </p>                                
                        </div>
                    </div>
                ))}
                <div className="flex justify-between mt-4 p-1">
                    <button className="hover:font-bold hover:cursor-pointer" onClick={handlePagination.handlePrevPage} disabled={page === 1}>Previous</button>
                    <span>{page} / {totalPages}</span>
                    <button className="hover:font-bold hover:cursor-pointer" onClick={handlePagination.handleNextPage} disabled={page === totalPages}>Next</button>
                </div>
            </section>
        </section>
    );
}
