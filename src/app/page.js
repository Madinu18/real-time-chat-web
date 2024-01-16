// /src/app/page.js
"use client";
import { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const IndexPage = () => {
  const [nama, setNama] = useState('');
  const [kodeRuangan, setKodeRuangan] = useState('');

  const buatRuangan = async () => {
    const nomor_random = Math.floor(Math.random() * 1000).toString();
    const database = firebase.database();
    const ruanganRef = database.ref(`${nomor_random}`); // Menggunakan nomor room sebagai key

    const ruanganSnapshot = await ruanganRef.once('value');
    if (!ruanganSnapshot.exists()) {
      // Simpan informasi admin ke dalam ruangan
      await ruanganRef.set({
        list: {
          admin: nama,
          member: [],
        },
      });

      // Navigasi ke halaman ruangan dengan nomor_random dan nama pengguna
      window.location.href = `/${nomor_random}?nama=${nama}`;
    } else {
      console.log('Ruangan sudah ada, mungkin implementasinya disini');
    }
  };

  const masukRuangan = async () => {
    const database = firebase.database();
    const ruanganRef = database.ref(`${kodeRuangan}`);

    const ruanganSnapshot = await ruanganRef.once('value');
    if (ruanganSnapshot.exists()) {
      const listRef = ruanganRef.child('list');
      const listSnapshot = await listRef.once('value');

      if (listSnapshot.exists()) {
        // Ambil array member dari snapshot
        const currentMembers = listSnapshot.val().member || [];
        // Tambahkan nama pengguna ke array
        const updatedMembers = [...currentMembers, nama];

        // Update array member di dalam list
        await listRef.update({ member: updatedMembers });
      }

      // Navigasi ke halaman ruangan dengan kodeRuangan dan nama pengguna
      window.location.href = `/${kodeRuangan}?nama=${nama}`;
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
