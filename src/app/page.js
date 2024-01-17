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
    <div className='bg-[#EEF5FF] flex items-center justify-center h-screen'>
        <div className='bg-[#86B6F6] w-[30rem] mx-auto flex flex-col p-14 rounded-xl'>
          <h1 className='text-center text-3xl font-extrabold text-white mb-6'>Real Time Chat Apps</h1>
          <label className='text-white mb-2 text-xl font-extrabold'>Nama</label>
          <input className='bg-white text-black mb-4 text-xl rounded-md p-2 font-bold' type="text" value={nama} onChange={(e) => setNama(e.target.value)} />
          <label className='text-white mb-2 text-xl font-extrabold'>Kode Ruangan</label>
          <input className='bg-white text-black mb-4 text-xl rounded-md p-2 font-bold' type="text" value={kodeRuangan} onChange={(e) => setKodeRuangan(e.target.value)} />
          <button className='mb-3 text-xl bg-[#2a9df4] border-2 border-black p-2 rounded-lg text-black font-bold hover:bg-opacity-50' onClick={buatRuangan}>Buat Ruangan Baru</button>
          <button className='text-xl bg-[#B4D4FF] border-2 border-black p-2 rounded-lg text-black font-bold hover:bg-opacity-50' onClick={masukRuangan}>Masuk ke Ruangan</button>
        </div>
    </div>
  );
};

export default IndexPage;
