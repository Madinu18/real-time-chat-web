// /src/app/page.js
"use client";
import { useState } from "react";
import firebase from "@/function/firebase";
import RenderImage from "@/components/RenderImage";
import Modal from "react-modal";
import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const IndexPage = () => {
  const [nama, setNama] = useState("");
  const [kodeRuangan, setKodeRuangan] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    console.log(selectedImage);
  };

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
    <div className="bg-[#EEF5FF] px-5 md:p-14 flex flex-col items-center justify-center min-h-screen">
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
          <h1 className="text-center md:text-left text-xl md:text-3xl font-extrabold text-white mb-6">
            Real Time Chat Apps
          </h1>
          {selectedImage ? (
            <div
              className="mx-auto mb-2 w-20 h-20 rounded-full border-black relative group"
              onClick={openModal}
              style={{ cursor: "pointer" }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full md:hidden">
                <span className="text-white text-xs font-bold">Change</span>
              </div>
              <Image
                src={`/img/${selectedImage}.png`}
                alt="Selected Profile"
                width={80}
                height={80}
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div
              className="mx-auto mb-2 w-20 h-20 rounded-full border-black relative bg-black bg-opacity-40 flex justify-center items-center"
              onClick={openModal}
              style={{ cursor: "pointer" }}
            >
              <PlusIcon className="w-12 h-12 text-white" />
            </div>
          )}
          <Modal
            isOpen={modalOpen}
            onRequestClose={closeModal}
            contentLabel="Pilih Foto Profil"
            className="w-full h-full px-10 flex items-center justify-center bg-[#2a9df4] bg-opacity-30"
          >
            <div className="flex flex-col justify-center bg-[#2a9df4] p-8 rounded-lg relative mx-auto w-96">
              <div className="grid grid-cols-4 gap-4 mb-7 justify-items-center">
                {[...Array(20)].map((_, index) => (
                  <RenderImage
                    key={index}
                    index={index}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                  />
                ))}
              </div>
              <button
                className="text-xl bg-blue-500 border-2 border-black p-2 rounded-lg text-white font-bold hover:bg-blue-700"
                onClick={closeModal}
              >
                Tutup
              </button>
            </div>
          </Modal>
          <label className="text-white mb-2 text-base md:text-xl font-extrabold">
            Nama
          </label>
          <input
            className="bg-white text-black mb-4 text-base md:text-xl rounded-md p-2 font-bold"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          <label className="text-white mb-2 text-base md:text-xl font-extrabold">
            Kode Ruangan
          </label>
          <input
            className="bg-white text-black mb-4 text-base md:text-xl rounded-md p-2 font-bold"
            type="text"
            value={kodeRuangan}
            onChange={(e) => setKodeRuangan(e.target.value)}
          />
          <button
            className="mb-3 md:mb-0 text-base md:text-xl bg-[#2a9df4] border-2 border-black p-2 rounded-lg text-black font-bold hover:bg-opacity-50"
            onClick={buatRuangan}
          >
            Buat Ruangan Baru
          </button>
          <button
            className="text-base md:text-xl bg-[#B4D4FF] border-2 border-black p-2 rounded-lg text-black font-bold hover:bg-opacity-50 mt-2 md:mt-0"
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
