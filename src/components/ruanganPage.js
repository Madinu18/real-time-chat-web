// Imports
import { useEffect, useState, useCallback, useRef } from "react";
import "firebase/database";
import firebase from "@/function/firebase";
import {
  ArrowLeftOnRectangleIcon,
  PaperAirplaneIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import ConfirmationModal from "./ConfirmationModal";

// Component
const RuanganPage = ({ slug: initialSlug }) => {
  // State variables
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [admin, setAdmin] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [slug] = useState(initialSlug);
  const chatContentRef = useRef(null);
  const databaseRef = useRef(firebase.database());
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

  const toggleNavbar = () => {
    setNavbarOpen(!navbarOpen);
  };

  const openConfirmationModal = () => {
    setConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalOpen(false);
  };

  const handleLeaveRoom = async () => {
    openConfirmationModal();
  };

  // Refs
  const database = firebase.database();
  const path = window.location.pathname;
  const nomorRuangan = path.replace("/", "");
  const ruanganRef = database.ref(nomorRuangan);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nama = params.get("nama");
    setUserName(nama || "Guest");
  }, [slug]);

  // Effect to set user name from query params
  useEffect(() => {
    setIsAdmin(admin.nama === userName);
  }, [admin, userName]);

  const handleMessages = useCallback(
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.values(data);
        setMessages(messagesArray);
      }
    },
    [setMessages]
  );

  useEffect(() => {
    const messagesRef = databaseRef.current.ref(`${nomorRuangan}/messages`);

    messagesRef.on("value", handleMessages);

    return () => {
      messagesRef.off("value", handleMessages);
    };
  }, [slug, handleMessages, nomorRuangan, databaseRef]);

  const handleListRef = useCallback(
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data) {
          const adminData = data.admin || {};
          const membersData = data.member || [];
          const selectedImageData =
            userName === adminData.nama
              ? adminData.gambar
              : membersData.find((member) => member.nama === userName)?.gambar;

          setAdmin(adminData);
          setMembers(membersData);
          setSelectedImage(selectedImageData);
        }
      }
    },
    [setAdmin, setMembers, setSelectedImage, userName]
  );

  useEffect(() => {
    const listRef = databaseRef.current.ref(`${nomorRuangan}/list`);

    listRef.on("value", handleListRef);

    return () => {
      listRef.off("value", handleListRef);
    };
  }, [slug, userName, databaseRef, handleListRef, nomorRuangan]);

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      const messagesRef = database.ref(`${nomorRuangan}/messages`);
      const timestamp = firebase.database.ServerValue.TIMESTAMP;

      console.log(selectedImage);

      ruanganRef
        .once("value")
        .then((snapshot) => {
          if (snapshot.exists()) {
            messagesRef.push({
              sender: userName,
              senderImage: selectedImage,
              text: newMessage,
              timestamp,
            });

            setNewMessage("");
          } else {
            window.location.href = "/";
          }
        })
        .catch((error) => {
          console.error("Error checking existence:", error.message);
        });
    }
  };

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const leaveRoom = async () => {
    try {
      if (admin.nama === userName) {
        await ruanganRef.remove();
        window.location.href = "/";
      } else {
        const listRef = ruanganRef.child("list/member");

        for (let key in members) {
          if (members[key].nama === userName) {
            delete members[key];

            const filteredMembers = members.filter((member) => member !== null);

            await listRef.set(filteredMembers);
          }
        }

        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error leaving room:", error.message);
    }
  };

  useEffect(() => {
    const listRef = databaseRef.current.ref(`${nomorRuangan}/list`);

    const handleListChange = async (snapshot) => {
      handleListRef(snapshot);

      if (!snapshot.exists()) {
        window.location.href = "/";
        return;
      }

      const updatedList = snapshot.val();
      const isAdmin = updatedList?.admin?.nama === userName;
      const isUserStillPresent =
        !isAdmin &&
        updatedList?.member?.some((member) => member.nama === userName);
      console.log(isUserStillPresent);

      if (!isUserStillPresent && !isAdmin) {
        window.location.href = "/";
      }
    };

    listRef.on("value", handleListChange);

    return () => {
      listRef.off("value", handleListChange);
    };
  }, [nomorRuangan, handleListRef, databaseRef, userName]);

  const removeMember = async (memberName) => {
    try {
      const listRef = ruanganRef.child("list/member");

      // Remove the member from the list
      const updatedMembers = members.filter(
        (member) => member.nama !== memberName
      );
      await listRef.set(updatedMembers);
    } catch (error) {
      console.error("Error removing member:", error.message);
    }
  };

  // Component rendering
  return (
    <div className="h-dvh flex flex-col">
      {/* Navbar */}
      <div className="bg-[#86B6F6] p-6">
        <button
          className="btn font-bold absolute top-3 left-3 px-2 md:px-3 md:hidden"
          onClick={toggleNavbar}
        >
          {navbarOpen ? (
            <XMarkIcon className="w-5 md:h-10" />
          ) : (
            <Bars3Icon className="w-5 md:h-10" />
          )}
        </button>
        <h1 className="text-white text-xl font-bold flex justify-center text-center">
          Real Time Chat Room: {nomorRuangan}
        </h1>
        <button
          className="btn btn-error font-bold absolute top-3 right-3 px-2 md:px-3"
          onClick={handleLeaveRoom}
        >
          <ArrowLeftOnRectangleIcon className="w-5 md:h-10" />
          <p className="text-base md:text-xl hidden md:inline">Leave room</p>
        </button>
      </div>
      {/* Konten */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar */}
        <div
          className={`md:border-r md:border-[#86B6F6] md:w-2/5 bg-[#EEF5FF] text-black text-xl ${
            navbarOpen
              ? "absolute inset-y-0 left-0 transform translate-x-0 transition-transform z-50"
              : "hidden"
          } md:inline md:z-40`}
          style={{ marginTop: navbarOpen ? "76px" : "0" }}
        >
          <ul>
            <li className="border-b border-black p-3 font-bold text-red-500">
              {admin && (
                <div className="flex flex-row items-center">
                  <Image
                    alt="Admin's selected image"
                    src={`/img/${admin.gambar}.png`}
                    width={80}
                    height={80}
                    className="rounded-full mr-2 h-10 w-10 md:h-20 md:w-20"
                  />
                  <h2 className="text-base md:text-xl">{admin.nama} (Admin)</h2>
                </div>
              )}
            </li>
            {Object.entries(members).map(([userId, userData], index) => (
              <li key={index} className="border-b border-black p-3 font-bold">
                {userData && (
                  <div className="flex flex-row items-center">
                    <Image
                      alt={`${userData.nama}'s selected image`}
                      src={`/img/${userData.gambar}.png`}
                      width={80}
                      height={80}
                      className="rounded-full mr-2 h-10 w-10 md:h-20 md:w-20"
                    />
                    <h2 className="text-base md:text-xl">{userData.nama}</h2>
                    {isAdmin && (
                      <button
                        className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => removeMember(userData.nama)}
                      >
                        X
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* Konten utama */}
        <div className="flex flex-col flex-grow md:w-3/5 bg-white">
          <div className="flex-grow px-3 pt-3 text-xl overflow-y-auto h-[34rem] md:overflow-auto">
            {messages.map((message, index) => (
              <div
                className={`chat ${
                  message.sender === userName ? "chat-end" : "chat-start"
                } mb-3`}
                key={index}
              >
                <div className="chat-image avatar">
                  <div className="w-12 md:w-16 rounded-full">
                    {selectedImage && (
                      <Image
                        alt="User's selected image"
                        src={`/img/${
                          message.sender === userName
                            ? selectedImage
                            : message.senderImage
                        }.png`}
                        width={64}
                        height={64}
                      />
                    )}
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
                    message.sender === userName
                      ? "bg-[#86B6F6]"
                      : "bg-[#B4D4FF] bg-opacity-50"
                  }`}
                >
                  {message.text.split("\n").map((line, lineIndex) => (
                    <p className="text-base md:text-xl" key={lineIndex}>
                      {line}
                    </p>
                  ))}
                </div>
                <div className="chat-footer opacity-50"></div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#86B6F6] rounded-t-3xl flex">
            <textarea
              className="flex-grow text-base md:text-xl p-2 rounded-md bg-white text-black border-none mb-2 mr-2 md:mb-0 md:resize-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
            />
            <button
              className="bg-[#176B87] rounded-full p-3 align-middle mb-2"
              onClick={sendMessage}
            >
              <PaperAirplaneIcon className="h-5 w-5 md:h-8 md:w-8 text-white" />
            </button>
          </div>
        </div>
      </div>
      {/* Konfirmasi modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onCancel={closeConfirmationModal}
        onConfirm={() => {
          leaveRoom();
          closeConfirmationModal();
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default RuanganPage;
