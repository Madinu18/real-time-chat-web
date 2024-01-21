// /src/app/page.js
"use client";
import { useState } from "react";
import firebase from "@/function/firebase";
import RenderImage from "@/components/RenderImage";

const IndexPage = () => {
  const [nama, setNama] = useState("");
  const [kodeRuangan, setKodeRuangan] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const buatRuangan = async () => {
    try {
      const nomor_random = Math.floor(Math.random() * 1000).toString();
      const database = firebase.database();
      const ruanganRef = database.ref(`${nomor_random}`);

      const ruanganSnapshot = await ruanganRef.once("value");
      if (!ruanganSnapshot.exists()) {
        await ruanganRef.set({
          list: {
            admin: {
              nama: nama,
              gambar: selectedImage,
            },
            member: [],
          },
        });

        window.location.href = `/${nomor_random}?nama=${nama}`;
      } else {
        console.log("Ruangan sudah ada, mungkin implementasinya disini");
      }
    } catch (error) {
      console.error("Error buat ruangan:", error.message);
    }
  };

  const masukRuangan = async () => {
    try {
      const database = firebase.database();
      const ruanganRef = database.ref(`${kodeRuangan}`);

      const ruanganSnapshot = await ruanganRef.once("value");
      if (!ruanganSnapshot.exists()) {
        console.log("Ruangan tidak ditemukan, mungkin implementasinya disini");
        return;
      }

      const listRef = ruanganRef.child("list");
      const result = await listRef.transaction((currentData) => {
        if (!currentData) {
          return currentData;
        }

        const currentMembers = currentData.member || {};
        const memberId = Object.keys(currentMembers).length;

        currentData.member = {
          ...currentMembers,
          [memberId]: {
            gambar: selectedImage,
            nama: nama,
          },
        };

        return currentData;
      });

      if (result.committed) {
        window.location.href = `/${kodeRuangan}?nama=${nama}`;
      } else {
        console.log("Transaksi tidak berhasil, mungkin implementasinya disini");
      }
    } catch (error) {
      console.error("Error masuk ruangan:", error.message);
    }
  };

  return (
    <div className="bg-[#EEF5FF] flex flex-col items-center justify-center min-h-screen">
      <div className="bg-[#86B6F6] w-full md:w-[50rem] mx-auto flex flex-col md:flex-row p-4 md:p-14 rounded-xl justify-center items-center">
        <div className="mx-auto hidden md:flex">
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[...Array(20)].map((_, index) => (
              <RenderImage
                key={index}
                index={index}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col mx-auto mt-4 md:mt-0 md:ml-8">
          <h1 className="text-center md:text-left text-3xl font-extrabold text-white mb-6">
            Real Time Chat Apps
          </h1>
          <label className="text-white mb-2 text-xl font-extrabold">Nama</label>
          <input
            className="bg-white text-black mb-4 text-xl rounded-md p-2 font-bold"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          <label className="text-white mb-2 text-xl font-extrabold">
            Kode Ruangan
          </label>
          <input
            className="bg-white text-black mb-4 text-xl rounded-md p-2 font-bold"
            type="text"
            value={kodeRuangan}
            onChange={(e) => setKodeRuangan(e.target.value)}
          />
          <button
            className="mb-3 md:mb-0 text-xl bg-[#2a9df4] border-2 border-black p-2 rounded-lg text-black font-bold hover:bg-opacity-50"
            onClick={buatRuangan}
          >
            Buat Ruangan Baru
          </button>
          <button
            className="text-xl bg-[#B4D4FF] border-2 border-black p-2 rounded-lg text-black font-bold hover:bg-opacity-50 mt-2 md:mt-0"
            onClick={masukRuangan}
          >
            Masuk ke Ruangan
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
