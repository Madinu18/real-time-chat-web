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

const path = window.location.pathname;
const nomorRuangan = path.replace('/', '');
const database = firebase.database();
const ruanganRef = database.ref(nomorRuangan);

const RuanganPage = ({ slug: initialSlug }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [slug] = useState(initialSlug);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nama = params.get('nama');
    setUserName(nama || 'Guest');
  }, [slug]);

  useEffect(() => {
    const messagesRef = database.ref(`${nomorRuangan}/messages`);

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
      const messagesRef = database.ref(`${nomorRuangan}/messages`);
      const timestamp = firebase.database.ServerValue.TIMESTAMP;

      ruanganRef.once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          messagesRef.push({
            sender: userName,
            text: newMessage,
            timestamp,
          });

          setNewMessage('');
          console.log('Ada');
        } else {
          console.log('Tidak Ada');
          window.location.href = '/';
        }
      })
      .catch((error) => {
        console.error('Error checking existence:', error.message);
      });
    }
  };

  const leaveRoom = async () => {
    try {
      const adminRef = ruanganRef.child('list/admin');
      const adminSnapshot = await adminRef.once('value');
      const admin = adminSnapshot.val();

      if (admin === userName) {
        await ruanganRef.remove();
        window.location.href = '/';
      }
      else{
        const listRef = ruanganRef.child('list/member');
        const listSnapshot = await listRef.once('value');

        if (listSnapshot.exists()) {
          let currentMembers = listSnapshot.val();
    
          for (let key in currentMembers) {
            if (currentMembers[key] === userName) {
                delete currentMembers[key];
            }
          }
  
          await listRef.set(currentMembers);
          
          window.location.href = '/';
        } else {
          console.log('Nama pengguna tidak ditemukan dalam admin dan list/member');
        }
      }
    } catch (error) {
      console.error('Error leaving room:', error.message);
    }
  };

  return (
    <div>
      <h1>Ruangan: {nomorRuangan}</h1>
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
      <button onClick={leaveRoom}>Leave room</button>
    </div>
  );
};

export default RuanganPage;
