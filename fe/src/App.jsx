import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import Main from './components/Main'
import Login from './components/Login'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import AuthForm from './components/Login'
export const BASE_URL = "http://localhost:3000/"
function App() {
  const [user,setUser] = useState()
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'  element={<Main userH={user} setUserH={setUser}/>} />
        <Route path='/login'  element={<AuthForm userH={user} setUserH={setUser}/>} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;
