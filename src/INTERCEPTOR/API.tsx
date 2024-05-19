import axios from "axios";
import { useMyContext } from "../ContextProvider/ContextProvider.tsx";

const API = axios.create({
    baseURL: process.env.REACT_APP_SERVER_ADDRESS
})

function fetchToken(user: boolean, admin: boolean){
    const choice = admin? 'sutoken' : user ? 'token' : null;
    if (!choice) return null;

    const cookie = document.cookie.split(';').find(c => c.trim().startsWith(`${choice}=`))
    
    return cookie
}

API.interceptors.request.use((config) => {
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

    const token = fetchToken(authenticated, admin);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
}, error => {
    return Promise.reject(error)
})

export const createPost = async (formData: any) => {
    return API.post(`/api/createPost`, formData)
};

export default API