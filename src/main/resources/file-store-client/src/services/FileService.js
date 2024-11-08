// src/services/FileService.js
import axios from 'axios';

const API_URL = 'http://localhost:8088/api/files'; // Adjust if your backend is running on a different port

const FileService = {
    // Fetch all files
    getAllFiles: async (path = '') => {
        try {
            const response = await axios.get(API_URL, {
                params: { path },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching files:', error);
            throw error;
        }
    },

    // Upload a file
    uploadFile: async (file, currentPath) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', currentPath);

        const response = await axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    // Delete multiple files
    deleteFiles: async (filenames) => {
        try {
            await axios.delete(API_URL, {
                data: filenames,
            });
        } catch (error) {
            console.error('Error deleting multiple files:', error);
            throw error;
        }
    },
    downloadFile: async (filePath) => {
        try {
            const response = await axios.get(`${API_URL}/download`, {
                params: { path: filePath },
                responseType: 'blob', // Important for downloading files
            });

            // Create a link element and trigger the download only once
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filePath.split('/').pop()); // Extracts the file name from the path

            // Append to the DOM, click the link, and remove it after download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Revoke the Blob URL after the download to release memory
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    },
};

export default FileService;
