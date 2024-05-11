import React from "react";
import { Link } from "react-router-dom";

export default function Login()
{
    return(
        <section className="bg-gradient-to-b from-HIGHLIGHTB to-WHITE h-[50vh]">
            <div className="bg-WHITE w-[60%] m-auto top-10 relative rounded text-center">
                <h2 className="text-[1.25rem]">
                    LOGIN
                </h2> 
                <section className="flex flex-col justify-evenly items-center h-[8rem]">
                    <input className="border rounded p-1" type="text" name="userName" id="userName" placeholder="please Enter Username"/>
                    <input className="border rounded p-1" type="text" typeof="password" name="userName" id="userName" placeholder="please Enter Password"/>
                    <button className="bg-HIGHLIGHTA text-WHITE w-[40%] rounded shadow-lg hover:opacity-90" type="button" value="Login">Login</button>
                </section>
                <section className="p-5">
                    Want to
                    <Link className="bg-HIGHLIGHTA text-WHITE rounded p-1 ml-2 hover:opacity-90" to={'/Register'}> Register?</Link>
                </section>            
            </div>


        </section>
    )
}