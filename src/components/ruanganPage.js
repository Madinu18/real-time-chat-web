import { useEffect, useState, useRef } from "react";
import firebase from "firebase/app";
import "firebase/database";
import {
  ArrowLeftOnRectangleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

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
const nomorRuangan = path.replace("/", "");
const database = firebase.database();
const ruanganRef = database.ref(nomorRuangan);

const RuanganPage = ({ slug: initialSlug }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [admin, setAdmin] = useState("");
  const [members, setMembers] = useState([]);
  const [slug] = useState(initialSlug);
  const chatContentRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nama = params.get("nama");
    setUserName(nama || "Guest");
  }, [slug]);

  useEffect(() => {
    const messagesRef = database.ref(`${nomorRuangan}/messages`);

    messagesRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.values(data);
        setMessages(messagesArray);
      }
    });

    return () => {
      messagesRef.off("value");
    };
  }, [slug]);

  useEffect(() => {
    const listRef = database.ref(`${nomorRuangan}/list`);

    listRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const admin = data.admin;
        const members = data.member || [];

        // Update state untuk menampilkan data di UI
        setAdmin(admin);
        setMembers(members);
      }
    });


    return () => {
      listRef.off("value");
    };
  }, [slug]);

  useEffect(() => {
    // Set elemen konten chat ke bawah ketika ada pesan baru
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      const messagesRef = database.ref(`${nomorRuangan}/messages`);
      const timestamp = firebase.database.ServerValue.TIMESTAMP;

      ruanganRef
        .once("value")
        .then((snapshot) => {
          if (snapshot.exists()) {
            messagesRef.push({
              sender: userName,
              text: newMessage,
              timestamp,
            });

            setNewMessage("");
            console.log("Ada");
          } else {
            console.log("Tidak Ada");
            window.location.href = "/";
          }
        })
        .catch((error) => {
          console.error("Error checking existence:", error.message);
        });
    }
  };

  const leaveRoom = async () => {
    try {
      const adminRef = ruanganRef.child("list/admin");
      const adminSnapshot = await adminRef.once("value");
      const admin = adminSnapshot.val();

      if (admin === userName) {
        await ruanganRef.remove();
        window.location.href = "/";
      } else {
        const listRef = ruanganRef.child("list/member");
        const listSnapshot = await listRef.once("value");

        if (listSnapshot.exists()) {
          let currentMembers = listSnapshot.val();

          for (let key in currentMembers) {
            if (currentMembers[key] === userName) {
              delete currentMembers[key];
            }
          }

          await listRef.set(currentMembers);

          window.location.href = "/";
        } else {
          console.log(
            "Nama pengguna tidak ditemukan dalam admin dan list/member"
          );
        }
      }
    } catch (error) {
      console.error("Error leaving room:", error.message);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-[#86B6F6] p-6">
        <h1 className="text-white text-xl font-bold flex justify-center text-center">
          Real Time Chat Room: {nomorRuangan}
        </h1>
        <button
          className="btn btn-error font-bold absolute top-3 right-3"
          onClick={leaveRoom}
        >
          <ArrowLeftOnRectangleIcon className="h-10" />
          Leave room
        </button>
      </div>
      <div className="flex flex-row h-full">
        <div className="border-r border-[#86B6F6] w-2/5 flex-grow bg-[#EEF5FF] text-black text-xl">
          <ul>
            <li className="border-b border-black p-3 font-bold text-red-500">
              {admin} (Admin)
            </li>
            {members.map((member, index) => (
              <li key={index} className="border-b border-black p-3 font-bold">
                {member}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col w-3/5 bg-white">
          <div className="flex-grow text-black p-3 text-xl overflow-y-auto h-32" ref={chatContentRef}>
            {messages.map((message, index) => (
              <div
                className={`chat ${
                  message.sender === userName ? "chat-end" : "chat-start"
                } mb-3`}
                key={index}
              >
                <div className="chat-image avatar">
                  <div className="w-16 rounded-full">
                    <img
                      alt="Tailwind CSS chat bubble component"
                      src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                    />
                  </div>
                </div>
                <div className="chat-header">
                  {message.sender}
                  <time className="text-xs opacity-50 pl-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </time>
                </div>
                <div
                  className={`chat-bubble text-black ${
                    message.sender === userName ? "bg-[#86B6F6]" : "bg-[#B4D4FF] bg-opacity-50"
                  }`}
                >
                  {message.text}
                </div>
                <div className="chat-footer opacity-50"></div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-[#86B6F6] rounded-t-3xl flex">
            <input
              className="flex-grow text-md p-2 rounded-md bg-white text-black border-none mr-2 align-middle"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
            />
            <button
              className="bg-[#176B87] rounded-full p-3 align-middle"
              onClick={sendMessage}
            >
              <PaperAirplaneIcon className="h-8 w-8 text-white align-middle" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuanganPage;
