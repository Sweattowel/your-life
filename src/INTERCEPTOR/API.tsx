import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_SERVER_ADDRESS
})

function fetchToken(){
    const tokenUser = document.cookie.split(';').find(c => c.trim().startsWith('authToken='));
    const tokenAdmin = document.cookie.split(';').find(c => c.trim().startsWith('superToken='));

    const userToken = tokenUser ? tokenUser.split('=')[1] : '';
    const adminToken = tokenAdmin ? tokenAdmin.split('=')[1] : '';

    return adminToken || userToken;
}

API.interceptors.request.use((config) => {
    
    const token = fetchToken();

    if (token !== '') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
}, error => {
    return Promise.reject(error)
})

export const createPost = async (formData: any) => {
    return API.post(`/api/createPost`, formData)
};
export const UpdateProfile = async (formData: any) => {
    return API.post(`/api/UpdateProfile`, formData,)
}
export default API