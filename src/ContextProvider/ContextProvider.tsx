import React, { ReactNode, createContext, useContext, useState } from "react";

interface MyContextProps {
    authenticated: boolean;
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
    admin: boolean;
    setAdmin: React.Dispatch<React.SetStateAction<boolean>>;

    userID: number;
    setUserID: React.Dispatch<React.SetStateAction<number>>;
    userName: string;
    setUserName: React.Dispatch<React.SetStateAction<string>>;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>; 

}

const MyContext = createContext<MyContextProps | undefined>(undefined);

export function ContextProvider({ children }: { children: ReactNode }) {
    const [authenticated, setAuthenticated] = useState<boolean>(false)
    const [admin, setAdmin] = useState<boolean>(false);
    
    const [userID, setUserID] = useState<number>(-1)
    const [userName, setUserName] = useState<string>("");
    const [email, setEmail] = useState<string>('')
    
    return (
        <MyContext.Provider
        value={{
            authenticated,
            setAuthenticated,
            admin,
            setAdmin,
            userID,
            setUserID,
            userName,
            setUserName,
            email,
            setEmail, 
        }}
        >
        {children}
        </MyContext.Provider>
    );
    }

    export function useMyContext() {
    const context = useContext(MyContext);

    if (!context) {
        throw new Error("useContext must be used within a MyContextProvider");
    }
    const {
        authenticated,
        setAuthenticated,
        admin,
        setAdmin,
        userID,
        setUserID,
        userName,
        setUserName,
        email,
        setEmail, 
    } = context;

    return [
    authenticated,
    setAuthenticated,
    admin,
    setAdmin,
    userID,
    setUserID,
    userName,
    setUserName,
    email,
    setEmail, 
    ] as const;
}
