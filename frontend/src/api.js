import axios from 'axios';

const api = axios.create({
    //baseURL: '/api', // Use relative path for reverse proxy
    baseURL: 'http://localhost:8000', //dev mode
});


// Request Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config && error.config.url === '/token';
        if (error.response && error.response.status === 401 && !isLoginRequest) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
};

export const fetchAnnouncements = async (category) => {
    const params = category ? { category } : {};
    const response = await api.get('/announcements/', { params });
    return response.data;
};

export const createAnnouncement = async (data) => {
    const response = await api.post('/announcements/', data);
    return response.data;
};

export const updateAnnouncement = async (id, data) => {
    const response = await api.patch(`/announcements/${id}`, data);
    return response.data;
};

export const deleteAnnouncement = async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
};

export const fetchFaqs = async () => {
    const response = await api.get('/faqs/');
    return response.data;
};

export const createFaq = async (data) => {
    const response = await api.post('/faqs/', data);
    return response.data;
};

export const updateFaq = async (id, data) => {
    const response = await api.patch(`/faqs/${id}`, data);
    return response.data;
};

export const deleteFaq = async (id) => {
    const response = await api.delete(`/faqs/${id}`);
    return response.data;
};

export default api;
