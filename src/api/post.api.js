import client from './client';

/**
 * post.api.js — Central API service for all post endpoints
 * Uses axios client for requests.
 * Base URL is /api/post (proxied to http://localhost:3000/post)
 */

export const getAllPosts = (page = 1, limit = 20) =>
    client.get(`post/all?page=${page}&limit=${limit}`);

export const getMyPosts = () =>
    client.get('post/my-posts');

export const createPostApi = (body) =>
    client.post('post/create', body);

/**
 * Upload media to Cloudinary via backend
 * @param {File} file
 * @param {Function} onProgress - callback(percent)
 */
export const uploadMedia = (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return client.post('post/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percent);
            }
        },
    });
};
