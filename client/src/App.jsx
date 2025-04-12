import React, { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { io, Socket } from "socket.io-client";
import axios from 'axios';


const App = () => {
  const roomName = "chat"
  const socket = useMemo(() => io('http://localhost:3000'), [])
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [username, setUsername] = useState("")
  const [sockid, setSockid] = useState("")
  const [isModal, setIsModal] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const modalRef = useRef(null);
  const inputRef = useRef();
  const socketRef = useRef(null);
  const [isServerAlive, setIsServerAlive] = useState(false);
  const [userCount, setUserCount] = useState("0");
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
    if (!message.trim()) {
      setMessage("")
      return
    }

    if (socketRef.current) {
      socketRef.current.emit('message', { message, roomName })
    }
    setMessage("")
  }

  const submitUsername = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setUsername("")
      return
    }
    setIsModal(false)

    if (socketRef.current) {
      socketRef.current.emit('submit-username', username);
    }
  }

  useEffect(() => {
    const pingServer = async () => {
      try {
        await axios.get('https://common-chat.onrender.com/health');
        inputRef.current.focus();  //To set focus on input on load
        setIsServerAlive(true);

        const newSocket = io('https://common-chat.onrender.com');
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
          console.log(newSocket.id);
          setSockid(newSocket.id);
        });

        newSocket.on('user-count', (msg) => {
          setUserCount(msg);
        });

        newSocket.on('recieved-message', (msg) => {
          const { username, message: text, id } = msg;
          const time = timeFunc();
          setMessages((prev) => [...prev, { username, text, id, time }]);
        });

      } catch (err) {
        console.error("Error in server:", err);
      }
    };

    pingServer();
    

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // useEffect(() => {
  //   socket.on('connect',() => {
  //     console.log(socket.id);
  //     setSockid(socket.id)
  //   })

  //   socket.on('user-count', msg => {
  //     setUserCount(msg)
  //     console.log(msg);

  //   })

  //   socket.on('recieved-message', msg => {
  //     const username = msg.username
  //     const text = msg.message
  //     const id = msg.id
  //     const time = timeFunc();
  //     // console.log(msg)
  //     setMessages(prev => [...prev, { username, text, id, time }])
  //   })

  //   inputRef.current.focus(); //Focuses on input when page loads
  //   ping();

  //   return () => socket.disconnect();
  // },[])

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


  function ScrollToBottom() {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth' }));
    return <div ref={elementRef} />;
  };

  useEffect(() => {
    if (messages.length != 0) {
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
                <button onClick={(e) => { e.preventDefault(); setIsModal(false) }} className='cross'><svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
              </div>
              <form className="username-form" onSubmit={submitUsername}>
                <label htmlFor="name-box">Username</label>
                <input name='name-box' className="name-box" placeholder='Enter username...' value={username} type="text" onChange={e => setUsername(e.target.value)} />
                <button className="send-name" type='submit'>Save Changes</button>
              </form>
            </div> :
            ""
          }
        </div>


        {/* Chat area */}
        <div id="chat-container" className={`${isModal ? "blur" : ""}`}>
          {
            isServerAlive ? 
            <>
            {isEmpty ?
            <div className="empty">
              <h2>Chat is Empty...</h2>
              <p>Be the one to break the ice!</p>
            </div> : ""}
          {messages.map((message, index) => (
            <div className="text-bubble" key={index}>
              <div className="text-image">
                {message.username.split(/\s/).reduce((response, word) => response += word.slice(0, 1).toUpperCase(), '').substring(0, 2)}
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
            </> : 
              <div className="loading-screen">
                {[1, 2, 3].map((_, i) => {
                  let width = 180 + i * 80;
                  const height = 24 + i * 6;  
                  if (i === 2) {
                    width = 180; 
                  }

                  return (
                    <div className="text-bubble loading-bubble" key={i}>
                      <div className="text-image loading-image"></div>
                      <div className="text-message loading-message">
                        <div className="username loading-username-wrapper">
                          <div className="loading-username other">
                            userName . time
                          </div>
                        </div>
                        <div
                          className="text other loading-text"
                          style={{ width: `${width}px`, height: `${height}px` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>


        {/* Input area */}
        <div id="input-container">
          <div className="form-wrapper">
            <div className="count">
              {isServerAlive ?
                <>
                  <div class="circle pulse green"></div>
                  <p>Users online : {userCount}</p>
                </>
                :
                <div className="users-loading">
                  <div class="circle pulse red"></div>
                  <p>Connecting...</p>
                </div>
              }
            </div>
            <form className="input-form" onSubmit={submitHandler}>
              <input ref={inputRef} className="input-box" placeholder='Enter Message...' value={message} type="text" onChange={e => setMessage(e.target.value)} />
              <button className="send-button" type='submit'><svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path className="stroke" d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="#808080" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
