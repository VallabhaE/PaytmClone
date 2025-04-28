import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import axios from "axios";
import { BASE_URL } from "../App";

function Main({ userH, setUserH }) {
    const [userSelected, setUserSelected] = useState(false);
    const [userInfoFull, setuserInfoFull] = useState({});
    const [listSearch, setListSearch] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);  // Store the selected user
    const refer = useRef();
    const ammount = useRef();
    const nav = useNavigate();

    // Fetch user info when the component is loaded
    useEffect(() => {
        if (!userH) {
            const cookieUser = Cookies.get('user');
            if (cookieUser) {
                setUserH(JSON.parse(cookieUser));
            } else {
                nav('/login');
            }
        }

        // If user is logged in, fetch their information
        if (userH) {
            const mg = JSON.parse(Cookies.get('user'));
            axios.get(BASE_URL + "api/v1/bank/get-user-info", {
                headers: {
                    Authorization: `Bearer ${mg.msg.payload}`,
                }
            }).then((resp) => {
                setuserInfoFull(resp.data);
            }).catch(err => {
                alert(err);
            });
        }
    }, [userH]);

    // Fetch user search results based on the search query (POST request)
    function getFilterH() {
        const query = refer.current.value;  // Capture the search term from input field
        if (!query) return; // Prevent search if query is empty

        axios.post(BASE_URL + "api/v1/bank/get-filter", {
            search: query,
        }, {
            headers: {
                Authorization: `Bearer ${userH?.msg?.payload}`, // Bearer token for authorization
            }
        }).then((resp) => {
            setListSearch(resp.data.msg.users); // Assuming the response is an array of search results
        }).catch(err => {
            alert("Error fetching search results:", err);
        });
    }

    // Handle selecting a user
    const handleSelectUser = (user) => {
        setSelectedUser(user);  // Set the selected user
        setListSearch([]);      // Clear the search results
    }

    const handlePay = () => {
        console.log(selectedUser)
        axios.post(BASE_URL + "api/v1/bank/pay", {
            receiverId: selectedUser.id,
            amount: ammount.current.value
        }, {
            headers: {
                Authorization: `Bearer ${userH?.msg?.payload}`, // Bearer token for authorization
            }
        }).then((resp) => {
            alert(resp.data.msg) // Assuming the response is an array of search results
            console.log(resp)
        }).catch(err => {
            console.log(err.response.data)
            const { status, msg } = (err.response.data)
            alert("Reason   :" + msg);
        });
    };

    // Function to render user info
    const renderUserInfo = () => {
        if (!userInfoFull) return null;

        // Render user information dynamically based on the object keys
        return Object.keys(userInfoFull).map((key) => {
            const value = userInfoFull[key];

            // Skip rendering if the value is an object or array
            if (typeof value === 'object' || Array.isArray(value)) {
                return null;
            }

            return (
                <div key={key} className="flex justify-between w-full p-2 border-b">
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong>:
                    <span>{value}</span>
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col h-screen w-screen">
            <Navbar />
            <main className="flex p-4 h-full">
                <div className='w-full border flex flex-col justify-center items-center gap-4'>
                    <div className='font-bold'>
                        {userH?.msg?.username && <h1>Welcome {userH?.msg?.username}</h1>}
                        <div>Notifications</div>
                    </div>
                    <div className="flex items-center space-x-2 pl-10">
                        <input
                            ref={refer}
                            type="text"
                            placeholder="Search user..."
                            className="bg-white rounded text-black p-1"
                        />
                        <button onClick={getFilterH} className="bg-blue-800 text-white rounded p-1 px-3">
                            Search
                        </button>
                    </div>

                    {/* Display selected user info */}
                    {selectedUser && (
                        <div className="w-full p-4 bg-gray-100 mt-4 rounded-md">
                            <h2 className="font-bold text-xl">Selected User</h2>
                            <div className="flex flex-col w-full mt-4">
                                <div className="flex justify-between w-full p-2 border-b">
                                    <strong>Username</strong>: <span>{selectedUser.username}</span>
                                </div>
                                {/* You can add more details here (email, balance, etc.) */}
                                <div className="flex justify-between w-full p-2 border-b">
                                    <strong>Email</strong>: <span>{selectedUser.email}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Render the user info */}
                    {userInfoFull && !selectedUser && (
                        <div className="w-full p-4 bg-gray-100 mt-4 rounded-md">
                            <h2 className="font-bold text-xl">User Information</h2>
                            <div className="flex flex-col w-full mt-4">
                                {renderUserInfo()}
                            </div>
                        </div>
                    )}

                    {/* Render search results */}
                    {listSearch?.length > 0 && !selectedUser && (
                        <div className="w-full p-4 bg-gray-100 mt-4 rounded-md">
                            <h2 className="font-bold text-xl">Search Results</h2>
                            <ul>
                                {listSearch.map((item, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSelectUser(item)} // Set the user as selected when clicked
                                        className="cursor-pointer hover:bg-gray-200 p-2"
                                    >
                                        {item.username}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <input ref={ammount} type="number" placeholder='Enter amount to send...' className='text-black border rounded p-2 ' />
                    <button onClick={handlePay} className='bg-blue-700 p-2 px-6 border rounded text-white font-bold'>
                        Pay
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Main;
