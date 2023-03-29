import { useState, useEffect } from 'react';
import { useImmer } from 'use-immer';

import { io } from 'socket.io-client';
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';
const socket = io(URL);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useImmer([]);

  function buttonClicked() {
    if (text) {
      if (isLoggedIn) {
        socket.emit('chat message', text);
      } else {
        socket.emit('login', text);
        setIsLoggedIn(true);
      }
      setText("");
    }
  }

  useEffect(() => {
    socket.on('connect', () => { setIsConnected(true) });
    socket.on('chat message', m => { setMessages(draft => { draft.push(m) }) });

    return () => {
      socket.off('connect');
      socket.off('chat message');
    };
  }, []);

  return (
    <div className="App">
      <div>Connected: {String(isConnected)}, Loggedin: {String(isLoggedIn)}</div>
      <ul>{messages.map(m => <li key={m.id}>[{m.name}] {m.msg}</li>)}</ul>
      <input value={text} placeholder={ isLoggedIn ? "Message" : "Name" } onChange={e => setText(e.target.value)}></input>
      <button onClick={buttonClicked} disabled={!text}>{ isLoggedIn ? "Send" : "Login" }</button>
    </div>
  )
}

export default App
