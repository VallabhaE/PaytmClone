import axios from 'axios';
import React, { useState } from 'react';
import { BASE_URL } from '../App';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthForm = ({ setUserH,userH }) => {
    const nav = useNavigate()
    if (userH!==undefined){
        nav("/")
    }

    const [isSignup, setIsSignup] = useState(false);
    const [user, setUser] = useState({
        email: '',
        password: '',
        username: '',
        phoneNumber: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (isSignup) {
            axios.post(BASE_URL + "api/v1/user/signup", {
                username: user.username,
                password: user.password,
                email: user.email,
                phoneNumber: user.phoneNumber,
            })
                .then((resp) => {
                    console.log("Signup successful:", resp.data);
                    alert("Signup successful! Please log in.");
                    setIsSignup(false); // Switch to login form
                })
                .catch((err) => {
                    console.error("Signup failed:", err);
                    alert("Signup failed. Please try again.");
                });
        } else {
            console.log('Login data:', {
                username: user.username,
                password: user.password,
            });
            axios.post(BASE_URL + "api/v1/user/signin", {
                username: user.username,
                password: user.password
            }).then((resp) => {
                const userData = resp.data;
                console.log(userData)
                setUserH(userData);
                // Save to cookie
                Cookies.set('user', JSON.stringify(userData), { expires: 7 });

            })
        }
    };

    return (
        <div className="bg-blue-700 h-screen w-screen flex flex-col justify-center items-center text-white">
            <h1 className="text-4xl font-bold mb-6">{isSignup ? 'Sign Up' : 'Login'}</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="flex flex-col items-center w-full max-w-md"
            >
                {isSignup && (
                    <>
                        <input
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="Enter Email"
                            className="w-full border rounded p-2 m-2 border-black text-black font-bold"
                            required
                        />
                        <input
                            name="phoneNumber"
                            value={user.phoneNumber}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter Phone Number"
                            className="w-full border rounded p-2 m-2 border-black text-black font-bold"
                            required
                        />
                    </>
                )}


                <input
                    name="username"
                    value={user.username}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter Username"
                    className="w-full border rounded p-2 m-2 border-black text-black font-bold"
                    required
                />
                <input
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Enter Password"
                    className="w-full border rounded p-2 m-2 border-black text-black font-bold"
                    required
                />

                <button
                    type="submit"
                    className="rounded p-2 px-6 bg-black text-white mt-4"
                >
                    {isSignup ? 'Sign Up' : 'Login'}
                </button>
            </form>

            <button
                onClick={() => {
                    setIsSignup((prev) => !prev)
                    setUser({
                        email: '',
                        password: '',
                        username: '',
                        phoneNumber: '',
                    })
                }

                }
                className="mt-6 text-sm underline"
            >
                {isSignup
                    ? 'Already have an account? Login'
                    : "Don't have an account? Sign Up"}
            </button>
        </div >
    );
};

export default AuthForm;
