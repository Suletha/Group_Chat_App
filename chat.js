const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
// const roomName=document.getElementById('room-name');
const userList = document.getElementById("users");
const localStorageKey = "chatMessages";

//retrieving token from local storage
const token = localStorage.getItem("token");
//user not logged in
if (!token) {
  window.location.href = "login.html";
}
console.log(token);
axios.defaults.headers.common["Authorization"] = `${token}`;

// Function to save a chat message in local storage
function saveMessageToLocalStorage(message) {
  let chatMessagesArray =
    JSON.parse(localStorage.getItem(localStorageKey)) || [];

  // Add the new message to the array
  chatMessagesArray.push(message);

  // Limit the array to the most recent 10 messages
  if (chatMessagesArray.length > 10) {
    chatMessagesArray.shift(); // Remove the oldest message
  }

  // Save the updated array back to local storage
  localStorage.setItem(localStorageKey, JSON.stringify(chatMessagesArray));
}

// Function to retrieve messages from local storage and display them
async function loadMessagesFromLocalStorage() {
  const chatMessagesArray =
    JSON.parse(localStorage.getItem(localStorageKey)) || [];

  // Display the messages in the chat interface
  chatMessages.innerHTML = "";
  chatMessagesArray.forEach((message) => {
    outputMessage(message);
  });
}

async function fetchUsersList() {
  try {
    const users = await axios.get("http://localhost:3000/users/all");
    console.log("users", users.data);
    for (let i = 0; i < users.data.length; i++) {
      outputUsers(users.data[i]);
    }
  } catch (err) {
    console.log(err);
  }
  loadMessagesFromLocalStorage();
}

// Load messages from local storage when the page is refreshed
window.addEventListener("load", fetchUsersList);

// Function to fetch messages from the server starting after the last message's ID
async function fetchMessagesFromServer(lastMessageId) {
  console.log(lastMessageId);
  try {
    const response = await axios.get(
      `http://localhost:3000/msg/all?lastMessageId=${lastMessageId + 1}`
    );

    const newMessages = response.data;
    newMessages.forEach((message) => {
      outputMessage(message);
      saveMessageToLocalStorage(message);
    });
  } catch (err) {
    console.log(err);
  }
}

//message submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  console.log(msg);

    const response = await axios.post(`http://localhost:3000/msg`, {
    msg: msg,
  });
  console.log(response.data);
  outputMessage(response.data.msg);

  // Save the message to local storage
  saveMessageToLocalStorage(response.data.msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.name} <span>${message.createdAt}</span></p>
    <p class="text">
        ${message.msg}
    </p>`;
  chatMessages.appendChild(div);
}


//Add users to dom
function outputUsers(userData) {
  const user = document.createElement("li");
  user.innerHTML = `<li>${userData.name}</li>`;
  userList.appendChild(user);
}


// Periodically fetch new messages from the server (e.g., every 1 seconds)
setInterval(() => {
  const chatMessagesArray =
    JSON.parse(localStorage.getItem(localStorageKey)) || [];
  const lastMessage = chatMessagesArray[chatMessagesArray.length - 1];

  // Use the last message's ID to fetch new messages from the server
  console.log(lastMessage);
  const lastMessageId = lastMessage ? lastMessage.id : -1;
  fetchMessagesFromServer(lastMessageId);
  //chatMessages.innerHTML = "";
  //loadMessagesFromLocalStorage();
}, 1000);