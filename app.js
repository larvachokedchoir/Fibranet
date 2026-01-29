const lockPanel = document.getElementById("lockPanel");
const profilePanel = document.getElementById("profilePanel");
const chatPanel = document.getElementById("chatPanel");
const statusBadge = document.getElementById("statusBadge");
const memberCount = document.getElementById("memberCount");

const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const passwordError = document.getElementById("passwordError");

const profileForm = document.getElementById("profileForm");
const nameInput = document.getElementById("nameInput");
const statusInput = document.getElementById("statusInput");
const welcomeHeading = document.getElementById("welcomeHeading");
const memberStatus = document.getElementById("memberStatus");

const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const lockButton = document.getElementById("lockButton");

const socket = typeof io === "function" ? io() : null;

const session = {
  unlocked: false,
  memberName: "",
  status: "",
  messages: [],
};

const updatePanels = () => {
  lockPanel.classList.toggle("hidden", session.unlocked);
  profilePanel.classList.toggle("hidden", !session.unlocked || session.memberName);
  chatPanel.classList.toggle("hidden", !session.memberName);

  statusBadge.textContent = session.memberName ? "In chat" : session.unlocked ? "Unlocked" : "Locked";
};

const addMessage = (name, text) => {
  session.messages.push({ name, text, time: new Date() });
  const message = document.createElement("div");
  message.className = "chat__message";
  message.innerHTML = `<strong>${name}</strong>${text}`;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

const addSystemMessage = (text) => {
  const message = document.createElement("div");
  message.className = "chat__message";
  message.innerHTML = `<strong>System</strong>${text}`;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!socket) {
    passwordError.textContent = "Server connection unavailable. Start the server to unlock.";
    return;
  }
  const value = passwordInput.value.trim();
  socket.emit("unlock", { password: value }, (response) => {
    if (!response?.ok) {
      passwordError.textContent = response?.error || "Incorrect password. Try again.";
      passwordInput.focus();
      return;
    }

    session.unlocked = true;
    passwordError.textContent = "";
    passwordInput.value = "";
    updatePanels();
  });
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!socket) {
    return;
  }
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }

  const status = statusInput.value.trim();

  socket.emit("profile", { name, status }, (response) => {
    if (!response?.ok) {
      return;
    }

    session.memberName = name;
    session.status = status;

    welcomeHeading.textContent = `Welcome, ${session.memberName}`;
    memberStatus.textContent = session.status ? `Status: ${session.status}` : "";
    nameInput.value = "";
    statusInput.value = "";
    updatePanels();
    messageInput.focus();
  });
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!socket) {
    return;
  }
  const text = messageInput.value.trim();
  if (!text) {
    messageInput.focus();
    return;
  }

  socket.emit("chat:message", { text }, (response) => {
    if (response?.ok) {
      messageInput.value = "";
      messageInput.focus();
    }
  });
});

lockButton.addEventListener("click", () => {
  session.unlocked = false;
  session.memberName = "";
  session.status = "";
  session.messages = [];
  chatWindow.innerHTML = "";
  updatePanels();
  passwordInput.focus();
  if (socket && socket.connected) {
    socket.disconnect();
    socket.connect();
  }
});

if (socket) {
  socket.on("chat:message", ({ name, text }) => {
    addMessage(name, text);
  });

  socket.on("chat:system", ({ text }) => {
    addSystemMessage(text);
  });

  socket.on("members:update", ({ count }) => {
    const label = count === 1 ? "member" : "members";
    memberCount.textContent = `${count} ${label}`;
  });
} else {
  passwordError.textContent = "Server connection unavailable. Start the server to unlock.";
  passwordInput.disabled = true;
  profileForm.querySelectorAll("input, button").forEach((el) => {
    el.disabled = true;
  });
  chatForm.querySelectorAll("input, button").forEach((el) => {
    el.disabled = true;
  });
}

updatePanels();
