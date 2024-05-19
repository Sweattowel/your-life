import React, { useState } from "react";
import ProfileDetails from './Dependencies/ProfileDetails/ProfileDetails.tsx'
import Login from "./Dependencies/AccountHandle/Login.tsx";
import { useMyContext } from "../../../ContextProvider/ContextProvider.tsx";

export default function ProfileHandle()
{
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

    return(
        <section className="ml-[10vw] w-[90vw]">
            {authenticated ? (
                <ProfileDetails />
            ) : (
                <Login />
            )}
        </section>
    )
}