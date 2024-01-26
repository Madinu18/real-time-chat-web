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
import EmojiPicker from "emoji-picker-react";
import cookie from 'js-cookie';

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
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const PAGE_KEY = "isDarkMode";

  const getPageTheme = () => {
    const storedValue = cookie.get(PAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : false;
  };

  const setPageTheme = (value) => {
    cookie.set(PAGE_KEY, JSON.stringify(value), { expires: 365 });
  };

  const [isDarkMode, setIsDarkMode] = useState(getPageTheme());

  useEffect(() => {
    setPageTheme(isDarkMode);
  }, [isDarkMode]);

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

  const toggleEmojiPicker = () => {
    setEmojiPickerOpen(!isEmojiPickerOpen);
  };

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    setNewMessage((prevMessage) => prevMessage + emoji);
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

  useEffect(() => {
    const listRef = databaseRef.current.ref(`${nomorRuangan}/list`);

    listRef.on("value", handleListRef);

    return () => {
      listRef.off("value", handleListRef);
    };
  }, [slug, userName, databaseRef, handleListRef, nomorRuangan]);

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
    <div
      className={`h-dvh flex flex-col ${
        isDarkMode ? "bg-[#2C3333]" : "bg-white"
      }`}
    >
      {/* Navbar */}
      <div className={`p-6 ${isDarkMode ? "bg-[#35155D]" : "bg-[#86B6F6]"}`}>
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
          className="btn btn-error font-bold absolute top-3 right-3 px-2 md:px-3 hidden md:flex"
          onClick={handleLeaveRoom}
        >
          <ArrowLeftOnRectangleIcon className="w-5 md:h-10" />
          <p className="text-base md:text-xl">Leave room</p>
        </button>
        <button
          className="absolute top-3 px-2 hidden md:block"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <svg
              className="swap-off fill-current w-10 h-10 md:w-12 md:h-12 text-[#c9c9c9]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          ) : (
            <svg
              className="swap-on fill-current w-10 h-10 md:w-12 md:h-12 text-[#fcff47]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
          )}
        </button>
        <button
          className="absolute top-4 right-3 md:hidden px-2 md:px-3"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <svg
              className="swap-off fill-current w-10 h-10 md:w-12 md:h-12 text-[#c9c9c9]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          ) : (
            <svg
              className="swap-on fill-current w-10 h-10 md:w-12 md:h-12 text-[#fcff47]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
          )}
        </button>
      </div>
      {/* Konten */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar */}
        <div
          className={`md:w-2/5 text-xl ${
            navbarOpen
              ? "absolute inset-y-0 left-0 transform translate-x-0 transition-transform z-10"
              : "hidden"
          } md:inline flex flex-col flex-grow md:border-r  ${
            isDarkMode
              ? "bg-[#512B81] text-white border-[#35155D] "
              : "bg-[#EEF5FF] text-black border-[#86B6F6]"
          }`}
          style={{ marginTop: navbarOpen ? "76px" : "0" }}
        >
          <div className="flex-grow overflow-y-auto h-full">
            <ul className="flex-grow h-full">
              <li
                className={`border-b p-3 font-bold text-red-500 ${
                  isDarkMode ? "border-[#35155D]" : "border-[#86B6F6]"
                }`}
              >
                {admin && (
                  <div className="flex flex-row items-center">
                    <Image
                      alt="Admin's selected image"
                      src={`/img/${admin.gambar}.png`}
                      width={80}
                      height={80}
                      className="rounded-full mr-2 h-10 w-10 md:h-20 md:w-20"
                    />
                    <h2 className="text-base md:text-xl">
                      {admin.nama} (Admin)
                    </h2>
                  </div>
                )}
              </li>
              {Object.entries(members).map(([userId, userData], index) => (
                <li
                  key={index}
                  className={`border-b p-3 font-bold ${
                    isDarkMode ? "border-[#35155D]" : "border-[#86B6F6]"
                  }`}
                >
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
                          className="ml-2 bg-red-500 text-white p-0.5 rounded-full"
                          onClick={() => removeMember(userData.nama)}
                        >
                          <XMarkIcon className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-grow flex justify-center items-center py-4 md:hidden">
            <button
              className="btn btn-error font-bold px-2 md:px-3"
              onClick={handleLeaveRoom}
            >
              <ArrowLeftOnRectangleIcon className="w-5 md:h-10" />
              <p className="text-base md:text-xl">Leave room</p>
            </button>
          </div>
        </div>
        {/* Konten utama */}
        <div className="flex flex-col flex-grow md:w-3/5">
          <div className="flex-grow px-3 pt-3 text-xl overflow-y-auto h-32 min-h-1 md:overflow-auto">
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
                <div
                  className={`chat-header ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  {message.sender}
                  <time className="text-xs opacity-50 pl-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </time>
                </div>
                <div
                  className={`chat-bubble ${
                    isDarkMode
                      ? `text-white ${
                          message.sender === userName
                            ? "bg-[#512B81]"
                            : "bg-[#8062D6] bg-opacity-50"
                        }`
                      : `text-black ${
                          message.sender === userName
                            ? "bg-[#86B6F6]"
                            : "bg-[#B4D4FF] bg-opacity-50"
                        }`
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

          <div
            className={`p-6 rounded-t-3xl flex items-center ${
              isDarkMode ? "bg-[#35155D]" : "bg-[#86B6F6]"
            }`}
          >
            <div className="flex flex-grow h-14 rounded-full bg-white content-center mr-2">
              <button
                className="pl-5 rounded-full align-middle mr-2 text-2xl md:text-4xl"
                onClick={toggleEmojiPicker}
              >
                😀
              </button>
              <textarea
                className="text-base w-full md:text-xl pt-3 rounded-r-full bg-white text-black border-none mb-2 mr-2 md:mb-0 md:resize-none focus:outline-none"
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
            </div>
            <button
              className="bg-[#176B87] rounded-full p-3 align-middle h-15 w-15 justify-center"
              onClick={sendMessage}
            >
              <PaperAirplaneIcon className="h-8 w-8 text-white" />
            </button>
          </div>
          {isEmojiPickerOpen && (
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="100%"
              searchDisabled="true"
            />
          )}
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
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default RuanganPage;
