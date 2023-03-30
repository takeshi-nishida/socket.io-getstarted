import { useState, useEffect } from 'react';
import { useImmer } from 'use-immer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

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
    <Container sx={{ padding: 0, height: '90vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Connected: {String(isConnected)}, Loggedin: {String(isLoggedIn)}</Typography>
        </Toolbar>
      </AppBar>
      <List sx={{ height: '80vh' }}>{messages.map(m =>
        <ListItem key={m.id}><ListItemText primary={"[" + m.name + "] " + m.msg} /></ListItem>
      )}</List>
      <Stack direction="row" spacing={2} sx={{ position: 'bottom' }}>
        <TextField variant="outlined" fullWidth value={text} label={ isLoggedIn ? "Message" : "Name" } onChange={e => setText(e.target.value)} />
        <Button variant="contained" onClick={buttonClicked} disabled={!text}>{ isLoggedIn ? "Send" : "Login" }</Button>
      </Stack>
    </Container>
  )
}

export default App
