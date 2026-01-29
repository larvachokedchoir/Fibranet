const PASSWORD = "fibra";

const lockPanel = document.getElementById("lockPanel");
const profilePanel = document.getElementById("profilePanel");
const chatPanel = document.getElementById("chatPanel");
const statusBadge = document.getElementById("statusBadge");

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

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = passwordInput.value.trim();
  if (value !== PASSWORD) {
    passwordError.textContent = "Incorrect password. Try again.";
    passwordInput.focus();
    return;
  }

  session.unlocked = true;
  passwordError.textContent = "";
  passwordInput.value = "";
  updatePanels();
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }

  session.memberName = name;
  session.status = statusInput.value.trim();

  welcomeHeading.textContent = `Welcome, ${session.memberName}`;
  memberStatus.textContent = session.status ? `Status: ${session.status}` : "";
  nameInput.value = "";
  statusInput.value = "";
  updatePanels();
  messageInput.focus();
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) {
    messageInput.focus();
    return;
  }

  addMessage(session.memberName, text);
  messageInput.value = "";
  messageInput.focus();
});

lockButton.addEventListener("click", () => {
  session.unlocked = false;
  session.memberName = "";
  session.status = "";
  session.messages = [];
  chatWindow.innerHTML = "";
  updatePanels();
  passwordInput.focus();
});

updatePanels();
