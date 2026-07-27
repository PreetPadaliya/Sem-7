import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Code,
  Send,
  Copy,
  Share,
  LogOut,
  Eye,
  Moon,
  Sun,
  Hash,
  MessageSquare,
} from "lucide-react";
import { io } from "socket.io-client";

// A simple spinner component for loading states
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-blue-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function CollabNotes() {
  const url = import.meta.env.VITE_SOC_URL;
  // Connection & Room Management
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);

  const [darkMode, setDarkMode] = useState(true);
  const [showRoomInput, setShowRoomInput] = useState(true);
  const [notification, setNotification] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  // Note Content
  const [noteContent, setNoteContent] = useState(
    '// Welcome to Collab Notes!\n// Enter a room ID to start collaborating in real-time.\n\nconsole.log("Hello, developer!");'
  );

  // Chat
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const chatBodyRef = useRef(null);

  // Auto-scroll chat to the bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const newSocket = io(url);
        setSocket(newSocket);
      } catch (error) {
        console.error("Failed to load Socket.io:", error);
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setIsConnected(true);
      showNotification("Connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      showNotification("Disconnected from server");
    });

    socket.on("room_joined", ({ roomId, users }) => {
      setCurrentRoom(roomId);
      setConnectedUsers(users.filter((id) => id !== socket.id));
      setShowRoomInput(false);
      showNotification(`Joined room: ${roomId}`);
    });

    socket.on("user_joined", ({ socketId, users }) => {
      setConnectedUsers(users.filter((id) => id !== socket.id));
      showNotification(`A user joined the room`);
    });

    socket.on("user_left", ({ socketId, users }) => {
      setConnectedUsers(users.filter((id) => id !== socket.id));
      showNotification(`A user left the room`);
    });

    socket.on("note_update", ({ content, sender }) => {
      if (sender !== socket.id) {
        setNoteContent(content);
      }
    });

    // This listener handles receiving messages from others
    socket.on("chat_message", (message) => {
      // Prevent adding message if it's from the current user and was already added optimistically
      if (message.user !== userId) {
        setChatHistory((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room_joined");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("note_update");
      socket.off("chat_message");
    };
  }, [socket, userId]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const joinRoom = () => {
    if (!roomId.trim() || !socket || !isConnected) return;
    socket.emit("join_room", roomId);
  };

  const leaveRoom = () => {
    if (!socket || !currentRoom) return;
    socket.emit("leave_room", currentRoom);
    setCurrentRoom("");
    setShowRoomInput(true);
    setConnectedUsers([]);
    setChatHistory([]);
    showNotification("Left the room");
  };

  const handleNoteChange = (value) => {
    setNoteContent(value);
    if (socket && currentRoom) {
      socket.emit("note_change", {
        roomId: currentRoom,
        content: value,
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(noteContent);
      showNotification("Code copied to clipboard!");
    } catch (err) {
      showNotification("Failed to copy code");
    }
  };

  const shareRoom = async () => {
    const roomLink = `${window.location.origin}?room=${currentRoom}`;
    try {
      await navigator.clipboard.writeText(roomLink);
      showNotification("Room link copied!");
    } catch (err) {
      showNotification("Failed to copy link");
    }
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !socket || !currentRoom) return;

    const message = {
      id: Date.now(),
      user: userId,
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // **FIX**: Emit to server and only update local state here (optimistic update)
    // The server should be configured NOT to broadcast back to the sender.
    // If it does, we handle it in the `socket.on` listener.
    socket.emit("chat_message", { roomId: currentRoom, message });
    setChatHistory((prev) => [...prev, message]);
    setChatMessage("");
  };

  // Check URL for room parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");
    if (roomParam) {
      setRoomId(roomParam);
    }
  }, []);

  const themeClass = darkMode ? "dark" : "";

  // ===== Room Join Screen =====
  if (showRoomInput) {
    return (
      <div
        className={`${themeClass} min-h-screen ${
          darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-800"
        }`}
      >
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div
            className={`w-full max-w-md p-8 rounded-xl shadow-2xl transition-colors ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Code className="w-9 h-9 text-blue-500" />
                <h1
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Collab Notes
                </h1>
              </div>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Real-time collaborative note-taking
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {isConnected ? "Connected" : "Connecting..."}
              </span>
              {!isConnected && <Spinner />}
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Hash
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter or create a Room ID"
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border text-base transition-all ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
                  } focus:ring-2 focus:border-transparent outline-none`}
                  onKeyPress={(e) => e.key === "Enter" && joinRoom()}
                />
              </div>

              <button
                onClick={joinRoom}
                disabled={!roomId.trim() || !isConnected}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Join Room
              </button>

              <button
                onClick={() => setRoomId(`room_${Date.now()}`)}
                className={`w-full text-sm font-medium ${
                  darkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                } transition-colors`}
              >
                or Generate a Random Room
              </button>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`fixed top-4 right-4 p-3 rounded-full transition-colors ${
              darkMode
                ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                : "bg-white text-gray-600 hover:bg-gray-200"
            }`}
            title="Toggle Theme"
          >
            {darkMode ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // ===== Main Editor Screen =====
  return (
    <div
      className={`${themeClass} flex flex-col h-screen ${
        darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Header */}
      <header
        className={`flex-shrink-0 border-b ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } shadow-sm`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <Code className="w-7 h-7 text-blue-500" />
              <div>
                <h1
                  className={`text-lg font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Room: <span className="text-blue-400">{currentRoom}</span>
                </h1>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {connectedUsers.length + 1} users online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChat(!showChat)}
                title={showChat ? "Hide Chat" : "Show Chat"}
                className={`p-2 rounded-lg transition-colors ${
                  showChat
                    ? "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPreview(!isPreview)}
                title={isPreview ? "Show Editor" : "Show Preview"}
                className={`p-2 rounded-lg transition-colors ${
                  isPreview
                    ? "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={copyToClipboard}
                title="Copy Code"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={shareRoom}
                title="Share Room Link"
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Share className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                title="Toggle Theme"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={leaveRoom}
                title="Leave Room"
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Editor Panel: Spans more width when chat is hidden */}
        <div
          className={`flex flex-col min-h-0 transition-all duration-300 ${
            showChat ? "lg:col-span-7" : "lg:col-span-9"
          }`}
        >
          <div
            className={`rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {isPreview ? (
              <pre
                className={`p-4 overflow-auto flex-1 text-sm font-mono ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <code>{noteContent}</code>
              </pre>
            ) : (
              <textarea
                value={noteContent}
                onChange={(e) => handleNoteChange(e.target.value)}
                className={`w-full h-full p-4 font-mono text-sm resize-none outline-none ${
                  darkMode
                    ? "bg-gray-800 text-white placeholder-gray-500"
                    : "bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Start typing your code here..."
              />
            )}
          </div>
        </div>

        {/* Sidebar: Contains Users and Chat */}
        <div
          className={`flex flex-col gap-4 min-h-0 transition-all duration-300 ${
            showChat ? "lg:col-span-5" : "lg:col-span-3"
          }`}
        >
          {/* Users Panel */}
          <div
            className={`rounded-lg shadow-lg p-4 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3
              className={`font-bold mb-3 flex items-center gap-2 text-lg ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <Users className="w-5 h-5" />
              Users ({connectedUsers.length + 1})
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                <span
                  className={`font-medium ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  You
                </span>
              </div>
              {connectedUsers.map((user, index) => (
                <div key={user} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    User #{index + 2}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Panel: Conditionally rendered */}
          {showChat && (
            <div
              className={`rounded-lg shadow-lg flex flex-col flex-1 min-h-[200px] lg:min-h-0 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3
                className={`font-bold p-4 border-b text-lg ${
                  darkMode
                    ? "text-white border-gray-700"
                    : "text-gray-900 border-gray-200"
                }`}
              >
                Chat
              </h3>
              <div
                ref={chatBodyRef}
                className="flex-1 p-4 overflow-y-auto space-y-4"
              >
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.user === userId ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-xs ${
                        msg.user === userId
                          ? "bg-blue-600 text-white"
                          : darkMode
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {msg.user === userId ? "You" : `User`} - {msg.timestamp}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className={`p-4 border-t ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-all ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:ring-2 focus:border-transparent`}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  />
                  <button
                    onClick={sendChatMessage}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl animate-fade-in-up">
          {notification}
        </div>
      )}
    </div>
  );
}
