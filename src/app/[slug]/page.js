// pages/ruangan/[slug].js
'use client';

import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const RuanganPage = ({ slug: initialSlug }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [slug, setSlug] = useState(initialSlug);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nama = params.get('nama');
    setUserName(nama || 'Guest');
  }, [slug]);

  useEffect(() => {
    const database = firebase.database();
    const messagesRef = database.ref(`chats/${slug}/messages`);

    messagesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.values(data);
        setMessages(messagesArray);
      }
    });

    return () => {
      messagesRef.off('value');
    };
  }, [slug]);

  const sendMessage = () => {
    if (newMessage.trim() !== '') {
      const database = firebase.database();
      const messagesRef = database.ref(`chats/${slug}/messages`);
      const timestamp = firebase.database.ServerValue.TIMESTAMP;

      messagesRef.push({
        sender: userName,
        text: newMessage,
        timestamp,
      });

      setNewMessage('');
    }
  };

  return (
    <div>
      <h1>Ruangan: {slug}</h1>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <strong>{message.sender}:</strong> {message.text} ({new Date(message.timestamp).toLocaleTimeString()})
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default RuanganPage;
