import React, { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {io, Socket} from "socket.io-client";


const App = () => {
  const roomName = "chat"
  const socket = useMemo(() => io('https://common-chat.onrender.com'),[])
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [username, setUsername] = useState("")
  const [sockid, setSockid] = useState("")
  const [isModal, setIsModal] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const modalRef = useRef(null);
  const [userCount, setUserCount] = useState("");
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];



  const timeFunc = () => {
    const date = new Date(Date.now());
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;
    return time
}

  const submitHandler = (e) => {
    e.preventDefault();
    if(!message.trim()){
      setMessage("")
      return
    }

    socket.emit('message', {message, roomName});
    setMessage("")
  }

  const submitUsername = (e) => {
    e.preventDefault();
    if(!username.trim()){
      setUsername("")
      return
    }
    setIsModal(false)
    socket.emit('submit-username', username);

  }

  useEffect(() => {
    socket.on('connect',() => {
      console.log(socket.id);
      setSockid(socket.id)
    })

    socket.on('user-count', msg => {
      setUserCount(msg)
      console.log(msg);
      
    })

    socket.on('recieved-message', msg => {
      const username = msg.username
      const text = msg.message
      const id = msg.id
      const time = timeFunc();
      // console.log(msg)
      setMessages(prev => [...prev, { username, text, id, time }])
    })

    return () => socket.disconnect();
  },[])

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModal(false);
      }
    }
    if (isModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModal]);


  function ScrollToBottom(){
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth' }));
    return <div ref={elementRef} />;
  };

  useEffect(() => {
    if(messages.length != 0){
      setIsEmpty(false);
    }
  }, [messages])

  return (
    <>
    <div id="container">
      {/* Navbar */}
      <div id="nav-container">
        
        <button className="settings" onClick={() => setIsModal(!isModal)}>
          <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.4" d="M12.1207 12.78C12.0507 12.77 11.9607 12.77 11.8807 12.78C10.1207 12.72 8.7207 11.28 8.7207 9.50998C8.7207 7.69998 10.1807 6.22998 12.0007 6.22998C13.8107 6.22998 15.2807 7.69998 15.2807 9.50998C15.2707 11.28 13.8807 12.72 12.1207 12.78Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path opacity="0.34" d="M18.7398 19.3801C16.9598 21.0101 14.5998 22.0001 11.9998 22.0001C9.39977 22.0001 7.03977 21.0101 5.25977 19.3801C5.35977 18.4401 5.95977 17.5201 7.02977 16.8001C9.76977 14.9801 14.2498 14.9801 16.9698 16.8001C18.0398 17.5201 18.6398 18.4401 18.7398 19.3801Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        </button>
        {isModal ? 
          <div className="username-modal" ref={modalRef}>
            <div className="controls">
              <h3>Settings</h3>
              <button onClick={(e) => {e.preventDefault(); setIsModal(false)}} className='cross'><svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
            </div>
            <form className="username-form" onSubmit={submitUsername}>
              <label htmlFor="name-box">Username</label>
              <input  name='name-box' className="name-box" placeholder='Enter username...' value={username} type="text" onChange={e => setUsername(e.target.value)}/>
              <button className="send-name" type='submit'>Save Changes</button>
            </form>
          </div> :
        ""
        }
      </div>


      {/* Chat area */}
      <div id="chat-container" className= {`${isModal ? "blur" : ""}`}>
        {isEmpty ? 
        <div className="empty">
          <h2>Chat is Empty...</h2>
          <p>Be the one to break the ice!</p>
        </div> : ""}
          {messages.map((message, index) => (
            <div className="text-bubble" key={index}>
              <div className="text-image">
                {message.username.split(/\s/).reduce((response,word)=> response+=word.slice(0,1).toUpperCase(),'').substring(0,2)}
              </div>
              <div className="text-message">
                <div className="username">
                  {message.username} • <span>{message.time}</span>
                </div>
                <div className={`text ${(message.id === sockid) ? "user" : "other"}`}>
                  {message.text}
                </div>
              </div>
              <ScrollToBottom />
            </div>
          ))}
      </div>


      {/* Input area */}
        <div id="input-container">
          <div className="form-wrapper">
            <div className="count">
              <div class="circle pulse green"></div>
              <p>Users online : {userCount}</p>
            </div>
            <form className="input-form" onSubmit={submitHandler}>
              <input className="input-box" placeholder='Enter Message...' value={message} type="text" onChange={e => setMessage(e.target.value)} />
              <button className="send-button" type='submit'>...</button>
            </form>
          </div>
        </div>
    </div>
    </>
  )
}

export default App
