'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/layout/AppWrapper';
import { setAuthData, setUserDetails } from '@/utils/cookies';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const OktaLogin = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const {
        isLoading,
        setAlert,
        setLoading,
        setUser,
        setAuthToken,
    } = useAppContext();


    const getAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("1");
            const response = await axios.get(`${BASE_URL}/sbs/me`, {
                withCredentials: true
            });
            console.log("2");
            console.log(response);

            if (response.data.code?.toLowerCase() === 'success') {
                setAlert('success', 'Login success!');
                if (response.data.data) {
                    console.log("set user and user details ");

                    setUser(response.data.data);
                    setUserDetails(response.data.data);
                }
                if (response.data.token) {
                    console.log("set token ");
                    setAuthToken(response.data.token);
                }

                if (response.data.token && response.data.refreshToken && response.data.data) {
                    console.log("set auth data ");
                    setAuthData(response.data.token, response.data.refreshToken, response.data.data);
                }

                // router.push('/');

            } else {
                // Error case
                const errorMessage = response.data.message || 'Login failed. Please try again.';
                setError(errorMessage);
            }

        } catch (error) {
            //handling various errors
            let errorMessage = 'An unexpected error occurred during login.';
            if (error instanceof Error) {
                if (error.message.includes('Missing required parameters')) {
                    errorMessage = 'Invalid login link. Please try logging in again.';
                } else if (error.message.includes('HTTP error')) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else {
                    errorMessage = error.message;
                }
            }

            console.error('OKTA login error:', error);
            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllData();
    }, []);



    if (isLoading) {
        return (
            <div className="flex flex-column align-items-center justify-content-center min-h-screen p-4">
                <ProgressSpinner style={{ width: '3rem', height: '3rem' }} className="mb-3" />
                <h2 className="text-lg text-900 mb-2">Processing OKTA Login...</h2>
                <p className="text-600 text-center">Please wait while we authenticate your account.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-column align-items-center justify-content-center min-h-screen p-4">
                <div className="border-1 surface-border border-round surface-100 p-4 w-full sm:w-30rem">
                    <div className="flex align-items-center mb-3">
                        <i className="pi pi-exclamation-triangle text-red-500 mr-2" style={{ fontSize: '1.5rem' }}></i>
                        <h2 className="m-0 text-900 text-lg">Login Failed</h2>
                    </div>
                    <p className="text-700 mb-4">{error}</p>
                    <div className="flex gap-2">
    
                        <Button
                            label="Back to Login"
                            onClick={() => router.push('/login')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-content-center">
            <h1 className="text-xl text-gray-600">Initializing OKTA Login...</h1>
        </div>
    );
};

export default OktaLogin;