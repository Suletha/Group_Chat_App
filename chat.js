const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
// const roomName=document.getElementById('room-name');
const userList = document.getElementById("users");

//retrieving token from local storage
const token = localStorage.getItem("token");
//user not logged in
if (!token) {
  window.location.href = "login.html";
}
console.log(token);
axios.defaults.headers.common["Authorization"] = `${token}`;


//message submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  console.log(msg);

  //emit message to the server
  //   socket.emit("chatMessage", msg);

  const response = await axios.post(`http://localhost:3000/msg`, {
    msg: msg,
  });
  console.log(response.data);
  outputMessage(response.data.msg);

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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const users = await axios.get("http://localhost:3000/users/all");
    console.log("users", users.data);
    for (let i = 0; i < users.data.length; i++) {
      outputUsers(users.data[i]);
    }

    const msgs = await axios.get("http://localhost:3000/msg/all");
    console.log("msgs", msgs.data);
    for (let i = 0; i < msgs.data.length; i++) {
      outputMessage(msgs.data[i]);
    }
  } catch (err) {
    console.log(err);
  }
});

setInterval(async () => {
  try {
    chatMessages.innerHTML = "";
    const msgs = await axios.get("http://localhost:3000/msg/all");
    console.log("msgs", msgs.data);
    for (let i = 0; i < msgs.data.length; i++) {
      outputMessage(msgs.data[i]);
    }
  } catch (err) {
    console.log(err);
  }
}, 1000);