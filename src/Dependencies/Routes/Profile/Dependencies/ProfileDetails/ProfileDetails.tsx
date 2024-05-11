import React from "react";

export default function ProfileDetails()
{
    return(
        <section className="bg-gradient-to-r from-HIGHLIGHTB to-HIGHLIGHTA w-[90vw] h-[100vh]">
            <div className="bg-WHITE h-[10rem] flex justify-evenly items-center">
                <h1 className="text-[1.5rem] bg-HIGHLIGHTA text-WHITE p-5 rounded">
                    Earl Jacob Jones
                </h1>
                <img className="rounded-full h-[8rem] shadow-lg" src="https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg" alt="You" />
            </div>

        </section>
    )
}