import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Self from 'components/Auth';
import axios from 'axios';
import { Navigate, useNavigate } from "react-router-dom";
import { OverridableTokenClientConfig, useGoogleLogin } from "@react-oauth/google";

export type AuthType = {
    firstname: string;
    setFirstname: Dispatch<SetStateAction<string>>;
    lastname: string;
    setLastname: Dispatch<SetStateAction<string>>;
    password: string;
    setPassword: Dispatch<SetStateAction<string>>;
    email: string;
    setEmail: Dispatch<SetStateAction<string>>;
    handleLogin: () => void;
    handleSignup: () => void;
    loginG: (overrideConfig?: OverridableTokenClientConfig | undefined) => void;
}

export default function Auth() {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const navigate = useNavigate();

    const assign = (data: any) => {
        console.log(data)
        setFirstname(data.given_name);
        setLastname(data.family_name);
        setPassword(data.id);
        setEmail(data.email);
    }

    const assign2 = (data: any) => {
        setPassword(data.id);
        setEmail(data.email);
    }

    const loginG = useGoogleLogin({
        onSuccess: (codeResponse) => {
            axios
                .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`, {
                    headers: {
                        Authorization: `Bearer ${codeResponse.access_token}`,
                        Accept: 'application/json',
                    },
                })
                .then((res) => {
                    axios
                        .get(`http://localhost:5000/user?email=${res.data.email}`)
                        .then((response) => {
                            if (response.data.length === 0) {
                                assign(res.data);
                                handleSignup();
                            } else {
                                assign2({ email: response.data.email, password: response.data.password });
                                handleLogin();
                            }
                        })
                        .catch((error) => console.error(error));
                })
                .catch((err) => console.error(err));
        },        
        onError: (error) => console.log('Authentication Failed:', error)
    });


    const clearAll = () => {
        setFirstname('');
        setLastname('');
        setPassword('');
        setEmail('');
    }

    const handleSignup = async () => {
        try {
            axios.post('http://127.0.0.1:5000/user', {
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: password
            });

            navigate("/todo");
            alert('User registered successfully!');
        } catch (error) {
            alert('Invalid credentials! Please try again');
            clearAll();
            console.error('Signup error:', error);
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/', { 
                email: email,
                password: password 
            });
            alert('Logged in successfully!');
            navigate("/todo");
        } catch (error) {
            alert('Invalid credentials! Please try again');
            clearAll();
            console.error('Login error:', error);
        }
    };

    return (
        <Self
            firstname={firstname}
            setFirstname={setFirstname}
            lastname={lastname}
            setLastname={setLastname}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            handleSignup={handleSignup}
            email={email}
            setEmail={setEmail}
            loginG={loginG}
        />
    );
}
