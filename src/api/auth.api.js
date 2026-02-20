import client from './client';

/**
 * auth.api.js — Central API service for all auth endpoints
 * Uses axios client for requests.
 * Base URL is /api (proxied to http://localhost:3000)
 * Endpoints should NOT start with / to use baseURL.
 */

export const initiateSignup = (email) =>
    client.post('user/signup/initiate', { email });

export const verifySignupOtp = ({ email, otp, name, password, role = 'user' }) =>
    client.post('user/signup/verify', { email, otp, name, password, role });

export const loginUser = ({ email, password }) =>
    client.post('user/login', { email, password });
