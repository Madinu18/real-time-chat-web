// /src/app/page.js
"use client"
import { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth'; // Import module auth jika diperlukan

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Inisialisasi Firebase app jika belum diinisialisasi
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const IndexPage = () => {
  const [nama, setNama] = useState('');
  const [kodeRuangan, setKodeRuangan] = useState('');

  const buatRuangan = async () => {
    const nomor_random = Math.floor(Math.random() * 1000).toString();
    const database = firebase.database(); 
    const ruanganRef = database.ref('chats').child(nomor_random);

    const ruanganSnapshot = await ruanganRef.once('value');
    if (!ruanganSnapshot.exists()) {
      await ruanganRef.set({});

      // Navigasi ke halaman ruangan dengan nomor_random dan nama pengguna
      window.location.href = `/${nomor_random}?nama=${nama}`;
    } else {
      console.log('Ruangan sudah ada, mungkin implementasinya disini');
    }
  };

  const masukRuangan = async () => {
    const database = firebase.database(); 
    const ruanganRef = database.ref('chats').child(kodeRuangan);

    const ruanganSnapshot = await ruanganRef.once('value');
    if (ruanganSnapshot.exists()) {
      // Navigasi ke halaman ruangan dengan kodeRuangan dan nama pengguna
      window.location.href = `/ruangan/${kodeRuangan}?nama=${nama}`;
    } else {
      console.log('Ruangan tidak ditemukan, mungkin implementasinya disini');
    }
  };

  return (
    <div>
      <label>
        Nama:
        <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} />
      </label>
      <br />
      <label>
        Kode Ruangan:
        <input type="text" value={kodeRuangan} onChange={(e) => setKodeRuangan(e.target.value)} />
      </label>
      <br />
      <button onClick={buatRuangan}>Buat Ruangan Baru</button>
      <button onClick={masukRuangan}>Masuk ke Ruangan</button>
    </div>
  );
};

export default IndexPage;
