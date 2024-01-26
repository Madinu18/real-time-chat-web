// /src/app/page.js
"use client";
import { useState, useEffect } from "react";
import firebase from "@/function/firebase";
import RenderImage from "@/components/RenderImage";
import Modal from "react-modal";
import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import cookie from 'js-cookie';

const IndexPage = () => {
  const [nama, setNama] = useState("");
  const [kodeRuangan, setKodeRuangan] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const PAGE_KEY = "isDarkMode";

  const getPageTheme = () => {
    const storedValue = cookie.get(PAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : false;
  };

  const setPageTheme = (value) => {
    cookie.set(PAGE_KEY, JSON.stringify(value), { expires: 365 }); // Menggunakan cookie.set() untuk menyimpan nilai tema dengan masa berlaku 1 tahun (365 hari)
  };

  const [isDarkMode, setIsDarkMode] = useState(getPageTheme());

  useEffect(() => {
    setPageTheme(isDarkMode);
  }, [isDarkMode]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    console.log(selectedImage);
  };

  const buatRuangan = async () => {
    if (!nama) {
      toast.error("Anda belum memasukan nama");
      return;
    }
    if (!selectedImage) {
      toast.error("Anda belum memilih gambar");
      return;
    }

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

  const checkNamaExist = async (nama, kodeRuangan) => {
    try {
      const database = firebase.database();

      // Cek apakah nama ada di ruangan sebagai admin
      const ruanganAdminRef = database.ref(`${kodeRuangan}/list/admin`);
      const adminSnapshot = await ruanganAdminRef.once("value");
      if (
        adminSnapshot.exists() &&
        adminSnapshot.child("nama").val() === nama
      ) {
        return true; // Nama sudah ada sebagai admin
      }

      // Cek apakah nama ada di ruangan sebagai member
      const ruanganMemberRef = database.ref(`${kodeRuangan}/list/member`);
      const memberSnapshot = await ruanganMemberRef
        .orderByChild("nama")
        .equalTo(nama)
        .once("value");
      if (memberSnapshot.exists()) {
        return true; // Nama sudah ada sebagai member
      }

      return false; // Nama tidak ada di ruangan
    } catch (error) {
      console.error("Error checking nama exist:", error.message);
      return false;
    }
  };

  const masukRuangan = async () => {
    if (!nama) {
      toast.error("Anda belum memasukan nama");
      return;
    }
    if (!kodeRuangan) {
      toast.error("Anda belum memasukan kode ruangan");
      return;
    }
    if (!selectedImage) {
      toast.error("Anda belum memilih gambar");
      return;
    }

    const namaExists = await checkNamaExist(nama, kodeRuangan);

    if (namaExists) {
      toast.error("Maaf, nama yang Anda inputkan sudah ada di ruangan");
      return;
    }

    try {
      const database = firebase.database();
      const ruanganRef = database.ref(`${kodeRuangan}`);

      const ruanganSnapshot = await ruanganRef.once("value");
      if (!ruanganSnapshot.exists()) {
        toast.error("Ruangan tidak tersedia");
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
    <div
      className={`px-5 md:p-14 flex flex-col items-center justify-center h-dvh ${
        isDarkMode ? "bg-[#2B2B2B]" : "bg-[#EEF5FF]"
      }`}
    >
      <button
        className="absolute top-3 right-3 px-2 md:px-3"
        onClick={toggleDarkMode}
      >
        {isDarkMode ? (
          <svg
            className="swap-off fill-current w-10 h-10 text-[#c9c9c9]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
          </svg>
        ) : (
          <svg
            className="swap-on fill-current w-10 h-10 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
          </svg>
        )}
      </button>
      <div
        className={`w-full md:w-[50rem] mx-auto flex flex-col md:flex-row p-4 md:p-14 rounded-xl justify-center items-center ${
          isDarkMode ? "bg-[#512B81]" : "bg-[#86B6F6]"
        }`}
      >
        <div className="mx-auto hidden md:flex md:flex-col">
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
          <p className="text-center text-blue-200">
            <a
              className="text-slate-500 "
              href="https://www.freepik.com/free-vector/bundle-with-set-face-business-people_6196665"
              target="_blank"
            >
              Image by studiogstock
            </a>{" "}
            on Freepik
          </p>
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
            className={`w-full h-full px-10 flex items-center justify-center bg-opacity-30 ${
              isDarkMode ? "bg-[#56298d]" : "bg-[#2a9df4]"
            }`}
          >
            <div
              className={`flex flex-col justify-center p-8 rounded-lg relative mx-auto w-96 ${
                isDarkMode ? "bg-[#56298d]" : "bg-[#2a9df4]"
              }`}
            >
              <div className="grid grid-cols-4 gap-4 mb-2 justify-items-center">
                {[...Array(20)].map((_, index) => (
                  <RenderImage
                    key={index}
                    index={index}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                  />
                ))}
              </div>
              <p className="text-center text-blue-200 mb-2">
                <a
                  className="text-slate-500 "
                  href="https://www.freepik.com/free-vector/bundle-with-set-face-business-people_6196665"
                  target="_blank"
                >
                  Image by studiogstock
                </a>{" "}
                on Freepik
              </p>
              <button
                className={`text-xl bg-opacity-50 border-2 p-2 rounded-lg text-white font-bold hover:bg-opacity-100 ${
                  isDarkMode
                    ? "bg-[#35155D] border-[#512B81]"
                    : "bg-blue-700 border-black"
                }`}
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
            className={`mb-3 text-base md:text-xl border-2 p-2 rounded-lg font-bold hover:bg-opacity-50 ${
              isDarkMode
                ? "bg-[#35155D] text-slate-200 border-[#512B81]"
                : "bg-[#2a9df4] text-black border-black"
            }`}
            onClick={buatRuangan}
          >
            Buat Ruangan Baru
          </button>
          <button
            className={`text-base md:text-xl border-2 p-2 rounded-lg text-black font-bold hover:bg-opacity-50 mt-2 md:mt-0 ${
              isDarkMode
                ? "bg-[#8062D6] text-slate-100 border-[#512B81]"
                : "bg-[#B4D4FF] text-black border-black"
            }`}
            onClick={masukRuangan}
          >
            Masuk ke Ruangan
          </button>
        </div>
      </div>
      <ToastContainer theme="colored" />
    </div>
  );
};

export default IndexPage;
