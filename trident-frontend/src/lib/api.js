import axios from "axios";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const api = {
    get: async (path) => {
        const res = await axios.get(`${API_BASE}${path}`);
        return res.data;
    },
    post: async (path, body) => {
        const res = await axios.post(`${API_BASE}${path}`, body);
        return res.data;
    }
};
