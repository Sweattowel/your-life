import React, { useState } from "react";
import ProfileDetails from './Dependencies/ProfileDetails/ProfileDetails.tsx'
import Login from "./Dependencies/AccountHandle/Login.tsx";
import Register from './Dependencies/AccountHandle/Register.tsx'

export default function ProfileHandle()
{
    const [logged, setLogged] = useState(false)

    return(
        <section className="ml-[10vw] w-[90vw]">
            {!logged ? (
                <ProfileDetails />
            ) : (
                <Login />
            )}
        </section>
    )
}