const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
pool.connect()
  .then(() => {
    console.log("✅ PostgreSQL Connected");
  })
  .catch((err) => {
    console.error("❌ Database Connection Error:", err);
  });

  app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    await pool.query(
      "INSERT INTO users(name, email, password) VALUES($1, $2, $3)",
      [name, email, password]
    );

    res.json({ message: "User created" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Database error" });
  }
});

const rooms = new Map();
const users = [];
const posts = [];
const upvotes = new Map();

let nextUserId = 1;
let nextPostId = 1;
let currentSessionUserId = null;

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

function createUser({ name, email, password }) {
  const user = {
    id: nextUserId++,
    name,
    email,
    password,
  };

  users.push(user);
  return user;
}

function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function getCurrentUser() {
  return users.find((user) => user.id === currentSessionUserId) || null;
}

function ensureDemoUser() {
  if (users.length === 0) {
    createUser({
      name: "Demo User",
      email: "demo@paster.local",
      password: "demo1234",
    });
  }
}

function createPost(payload) {
  const author = users.find((user) => user.id === payload.authorId) || null;
  const post = {
    id: nextPostId++,
    title: payload.title || "Untitled",
    content: payload.content || "",
    description: payload.description || "",
    language: payload.language || "plaintext",
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    bar: Boolean(payload.bar),
    burnAfterRead: Boolean(payload.bar),
    authorId: payload.authorId,
    author: publicUser(author),
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  posts.unshift(post);
  upvotes.set(post.id, new Set());
  return post;
}

function serializePost(post) {
  return {
    ...post,
    upvotes: upvotes.get(post.id)?.size || 0,
  };
}

function listPosts() {
  return posts.map(serializePost);
}

function getPostById(id) {
  return posts.find((post) => post.id === Number(id)) || null;
}

function applyFilters(items, query) {
  const searchTerm = (query.q || query.search || "").toString().trim().toLowerCase();

  if (!searchTerm) {
    return items;
  }

  return items.filter((post) => {
    const tagText = Array.isArray(post.tags) ? post.tags.join(" ") : "";
    const authorName = post.author?.name || "";
    return [
      post.title,
      post.content,
      post.description,
      post.language,
      tagText,
      authorName,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm);
  });
}

function requireAuthor(post, userId) {
  return post && Number(userId) && Number(userId) === Number(post.authorId);
}

ensureDemoUser();
currentSessionUserId = users[0].id;

app.get("/", (req, res) => {
  res.json({
    message: "Paster backend is running",
    activeRooms: rooms.size,
    totalConnections: io.engine.clientsCount,
    posts: posts.length,
    users: users.length,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    activeRooms: rooms.size,
    totalConnections: io.engine.clientsCount,
    posts: posts.length,
    users: users.length,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/rooms", (req, res) => {
  const roomList = Array.from(rooms.entries()).map(([id, room]) => ({
    id,
    userCount: room.users.length,
    createdAt: room.createdAt,
    hasContent: room.content.length > 0,
    messageCount: room.chatHistory.length,
  }));

  res.json(roomList);
});

app.get("/api/room/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (!room) {
    return res.json({ exists: false });
  }

  res.json({
    exists: true,
    userCount: room.users.length,
    createdAt: room.createdAt,
  });
});

app.post("/user/", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Please fill all the fields" });
  }

  const existingUser = users.find(
    (user) => user.email.toLowerCase() === String(email).toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const user = createUser({ name, email, password });
  currentSessionUserId = user.id;

  res.json(publicUser(user));
});

app.post("/user/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill all the fields" });
  }

  const user = users.find(
    (entry) =>
      entry.email.toLowerCase() === String(email).toLowerCase() &&
      entry.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  currentSessionUserId = user.id;
  res.json(publicUser(user));
});

app.get("/user/profile", (req, res) => {
  const user = getCurrentUser();

  if (!user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  res.json(publicUser(user));
});

app.post("/user/logout", (req, res) => {
  currentSessionUserId = null;
  res.json({ message: "Logged out successfully" });
});

app.get("/post", (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 12, 1);
  const filtered = listPosts();
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  res.json({
    posts: paginated,
    currentPage: page,
    totalPosts: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  });
});

app.get("/post/search", (req, res) => {
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const filtered = applyFilters(listPosts(), req.query);

  res.json({
    posts: filtered.slice(0, limit),
  });
});

app.get("/post/tags", (req, res) => {
  const tagCounts = new Map();

  for (const post of posts) {
    for (const tag of post.tags || []) {
      const normalized = String(tag).trim();
      if (!normalized) {
        continue;
      }

      tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
    }
  }

  const tags = Array.from(tagCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([tag]) => tag);

  res.json({ tags });
});

app.get("/post/upvotes/data/:id", (req, res) => {
  const post = getPostById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const voterSet = upvotes.get(post.id) || new Set();
  const currentUser = getCurrentUser();

  res.json({
    upvotecount: voterSet.size,
    userupvote: currentUser ? voterSet.has(currentUser.id) : false,
  });
});

app.post("/post/upvote", (req, res) => {
  const { postId, userId } = req.body;
  const post = getPostById(postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const voterId = Number(userId) || currentSessionUserId;
  if (!voterId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const voterSet = upvotes.get(post.id) || new Set();
  const hasUpvoted = voterSet.has(voterId);

  if (hasUpvoted) {
    voterSet.delete(voterId);
  } else {
    voterSet.add(voterId);
  }

  upvotes.set(post.id, voterSet);

  res.json({
    message: hasUpvoted ? "Vote removed" : "Upvoted",
    upvotecount: voterSet.size,
  });
});

app.post("/post", (req, res) => {
  const { title, content, userId, bar, language, tags, description } = req.body;
  const authorId = Number(userId) || currentSessionUserId;

  if (!authorId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const post = createPost({
    title,
    content,
    authorId,
    bar,
    language,
    tags,
    description,
  });

  res.status(201).json(serializePost(post));
});

app.get("/post/:id", (req, res) => {
  const post = getPostById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  post.views += 1;
  post.updatedAt = new Date().toISOString();

  res.json(serializePost(post));
});

app.put("/post/:id", (req, res) => {
  const post = getPostById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const authorId = currentSessionUserId;
  if (!requireAuthor(post, authorId)) {
    return res.status(403).json({ message: "You are not authorized to edit this note" });
  }

  const { title, content, description, language, tags } = req.body;
  post.title = title ?? post.title;
  post.content = content ?? post.content;
  post.description = description ?? post.description;
  post.language = language ?? post.language;
  post.tags = Array.isArray(tags) ? tags : post.tags;
  post.updatedAt = new Date().toISOString();

  res.json(serializePost(post));
});

app.delete("/post/:id", (req, res) => {
  const postIndex = posts.findIndex((entry) => entry.id === Number(req.params.id));

  if (postIndex === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  const post = posts[postIndex];
  const suppliedUserId = Number(req.body?.userId);
  const authorId = suppliedUserId || currentSessionUserId;

  if (!requireAuthor(post, authorId)) {
    return res.status(403).json({ message: "You are not authorized to delete this note" });
  }

  posts.splice(postIndex, 1);
  upvotes.delete(post.id);

  res.json({ message: "Post deleted successfully" });
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: [],
        content:
          '// Welcome to Real-time Collaborative Notes!\n// Start typing to share your code in real-time\n\nconsole.log("Hello, collaborative world!");',
        chatHistory: [],
        createdAt: new Date(),
      });
    }

    const room = rooms.get(roomId);

    if (!room.users.includes(socket.id)) {
      room.users.push(socket.id);
    }

    console.log(
      `📝 User ${socket.id} joined room ${roomId} (${room.users.length} users)`
    );

    socket.emit("room_joined", {
      roomId,
      users: room.users,
      content: room.content,
      chatHistory: room.chatHistory,
    });

    socket.to(roomId).emit("user_joined", {
      socketId: socket.id,
      users: room.users,
    });

    if (room.content) {
      socket.emit("note_update", {
        content: room.content,
        sender: "system",
      });
    }
  });

  socket.on("note_change", ({ roomId, content }) => {
    const room = rooms.get(roomId);
    if (!room || !room.users.includes(socket.id)) {
      return;
    }

    room.content = content;

    console.log(`📝 Note updated in room ${roomId} by ${socket.id}`);

    socket.to(roomId).emit("note_update", {
      content,
      sender: socket.id,
    });
  });

  socket.on("chat_message", ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room || !room.users.includes(socket.id)) {
      return;
    }

    room.chatHistory.push(message);

    if (room.chatHistory.length > 100) {
      room.chatHistory = room.chatHistory.slice(-100);
    }

    console.log(`💬 Chat message in room ${roomId} from ${socket.id}`);

    io.to(roomId).emit("chat_message", message);
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);

    const room = rooms.get(roomId);
    if (room) {
      room.users = room.users.filter((id) => id !== socket.id);

      console.log(
        `👋 User ${socket.id} left room ${roomId} (${room.users.length} users remaining)`
      );

      socket.to(roomId).emit("user_left", {
        socketId: socket.id,
        users: room.users,
      });

      if (room.users.length === 0) {
        console.log(`🗑️ Cleaning up empty room ${roomId}`);
        rooms.delete(roomId);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);

    for (const [roomId, room] of rooms.entries()) {
      if (room.users.includes(socket.id)) {
        room.users = room.users.filter((id) => id !== socket.id);

        socket.to(roomId).emit("user_left", {
          socketId: socket.id,
          users: room.users,
        });

        console.log(`👋 Removed ${socket.id} from room ${roomId}`);

        if (room.users.length === 0) {
          console.log(`🗑️ Cleaning up empty room ${roomId}`);
          rooms.delete(roomId);
        }
      }
    }
  });

  socket.on("typing_start", ({ roomId }) => {
    socket
      .to(roomId)
      .emit("user_typing", { socketId: socket.id, typing: true });
  });

  socket.on("typing_stop", ({ roomId }) => {
    socket
      .to(roomId)
      .emit("user_typing", { socketId: socket.id, typing: false });
  });
});

setInterval(() => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  for (const [roomId, room] of rooms.entries()) {
    if (room.users.length === 0 && room.createdAt < oneHourAgo) {
      console.log(`🗑️ Cleaning up old empty room ${roomId}`);
      rooms.delete(roomId);
    }
  }
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io enabled with CORS`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

process.on("SIGTERM", () => {
  console.log("🔄 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("👋 Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🔄 SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("👋 Server closed");
    process.exit(0);
  });
});
