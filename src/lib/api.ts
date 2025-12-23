const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

export const api = {
    async post(endpoint: string, data: any) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async get(endpoint: string) {
        const token = localStorage.getItem('token');
        const url = `${API_URL}${endpoint}`;
        console.log(`🌐 API GET: ${url}`);
        console.log(`🔑 Token:`, token ? 'Présent' : 'Absent');

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        console.log(`📡 Statut réponse: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log(`📥 Données JSON:`, data);
        return data;
    },

    async put(endpoint: string, data: any) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async delete(endpoint: string) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        return response.json();
    }
};
