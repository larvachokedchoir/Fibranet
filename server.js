const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const PASSWORD = "fibra";
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);
const io = new Server(server);

const members = new Map();

const broadcastMemberCount = () => {
  io.emit("members:update", { count: members.size });
};

io.on("connection", (socket) => {
  broadcastMemberCount();

  socket.on("unlock", ({ password }, callback) => {
    if (password !== PASSWORD) {
      callback({ ok: false, error: "Incorrect password." });
      return;
    }
    callback({ ok: true });
  });

  socket.on("profile", ({ name, status }, callback) => {
    const trimmed = (name || "").trim();
    if (!trimmed) {
      callback?.({ ok: false, error: "Name is required." });
      return;
    }
    members.set(socket.id, {
      name: trimmed,
      status: (status || "").trim(),
    });
    io.emit("chat:system", { text: `${trimmed} joined the chat.` });
    broadcastMemberCount();
    callback?.({ ok: true });
  });

  socket.on("chat:message", ({ text }, callback) => {
    const member = members.get(socket.id);
    const trimmed = (text || "").trim();
    if (!member || !trimmed) {
      callback?.({ ok: false });
      return;
    }
    io.emit("chat:message", {
      name: member.name,
      text: trimmed,
      time: new Date().toISOString(),
    });
    callback?.({ ok: true });
  });

  socket.on("disconnect", () => {
    const member = members.get(socket.id);
    if (member) {
      members.delete(socket.id);
      io.emit("chat:system", { text: `${member.name} left the chat.` });
      broadcastMemberCount();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Fibra chat server running on http://localhost:${PORT}`);
});
