const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const userList = document.getElementById("users");
const groupList = document.getElementById("groups");
const addGroupBtn = document.getElementById("add-group");
const addUserBtn = document.getElementById("add-user");
const logoutbtn = document.getElementById("logoutbtn");
const localStorageKey = "chatMessages";

let groupId = -1;

//retrieving token from local storage
const token = localStorage.getItem("token");
//user not logged in
if (!token) {
  window.location.href = "login.html";
}
// console.log(token);
axios.defaults.headers.common["Authorization"] = `${token}`;

logoutbtn.addEventListener("click", logout);
addGroupBtn.addEventListener("click", addGroup);
addUserBtn.addEventListener("click", addUser);

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

async function fetchGroupList() {
  
  try {
    const groups = await axios.get("http://localhost:3000/groups/all");
    //console.log("groups", groups.data);
    for (let i = 0; i < groups.data.length; i++) {
      outputGroups(groups.data[i]);
    }
  } catch (err) {
    console.log(err);
  }
}

// Load messages from local storage when the page is refreshed
window.addEventListener("load", fetchGroupList);

// Function to fetch messages from the server starting after the last message's ID
async function fetchMessagesFromServer(lastMessageId) {
  if (groupId !== -1) {
    //console.log(lastMessageId);
    try {
      const response = await axios.get(
        `http://localhost:3000/groups/${groupId}/msgs?lastMessageId=${
          lastMessageId + 1
        }`
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
}

//message submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (groupId !== -1) {
    const msg = e.target.elements.msg.value;
    //console.log(msg);

    const response = await axios.post(
      `http://localhost:3000/groups/${groupId}/msgs`,
      {
        msg: msg,
      }
    );
    //console.log(response.data);
    outputMessage(response.data.msg);

    // Save the message to local storage
    saveMessageToLocalStorage(response.data.msg);

    //clear input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
  } else {
    alert("Please select the group first");
  }
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
function outputUsersFromGroup(userData) {
  //console.log("userdata", userData);
  console.log(userData);
  const user = document.createElement("li");
  if (userData.UserGroups[0].isadmin === true) {
    user.innerHTML = `<li id='${userData.id}'>${userData.name} (Admin)</li><i class="fas fa-minus" id="${userData.id}"></i>`;
  } else {
    user.innerHTML = `<li id='${userData.id}'>${userData.name}</li><i class="fas fa-minus" id="${userData.id}"></i>`;
  }
  var iElement = user.getElementsByTagName("i");
  var liElement = user.getElementsByTagName("li");
  console.log(iElement[0]);
  iElement[0].addEventListener("click", removeUser);
  liElement[0].addEventListener("click", makeadmin);
  userList.appendChild(user);
}

// after adding user to group
function outputUsers(userData) {
  //console.log("userdata", userData);
  console.log(userData);
  const user = document.createElement("li");
  user.innerHTML = `<li id='${userData.id}'>${userData.name}</li><i class="fas fa-minus" id="${userData.id}"></i>`;
  var iElement = user.getElementsByTagName("i");
  var liElement = user.getElementsByTagName("li");
  console.log(iElement[0]);
  iElement[0].addEventListener("click", removeUser);
  liElement[0].addEventListener("click", makeadmin);
  userList.appendChild(user);
}

function outputGroups(groupData) {
  const group = document.createElement("li");
  if (groupData.UserGroups && groupData.UserGroups.length > 0 && groupData.UserGroups[0].groupId) {
    group.innerHTML = `<li id='${groupData.UserGroups[0].groupId}'>${groupData.name}</li>`;
    group.addEventListener("click", loadUserForGroup);
  } else {
    group.innerHTML = `<li>${groupData.name}</li>`;
  // You might want to handle this case differently or not add an event listener
  }
  groupList.appendChild(group);
}  


// add group
async function addGroup() {
  const groupname = prompt("Please enter the name of group:");
  if (groupname !== null) {
    // User clicked "OK" and provided input
    //console.log("group name:", groupname);
    const newGroup = await axios.post(`http://localhost:3000/groups/addgroup`, {
      groupname: groupname,
    });
    //console.log(newGroup.data);
    outputGroups(newGroup.data);
  } else {
    // User clicked "Cancel" or closed the dialog
    console.log("User canceled the input");
  }
}

// add user to group
async function addUser() {
  if (groupId !== -1) {
    const userEmail = prompt("Please enter the email id of user:");
    if (userEmail !== null) {
      try {
        const newUser = await axios.post(
          `http://localhost:3000/groups/${groupId}/user`,
          {
            userEmail: userEmail,
          }
        );
        alert("User added successfully");
        outputUsers(newUser.data.user);
      } catch (err) {
        alert("user does not exists");
      }
    } else {
      // User clicked "Cancel" or closed the dialog
      console.log("User canceled the input");
    }
  } else {
    alert("please select the group first");
  }
}

const loadUserForGroup = async (e) => {
  localStorage.removeItem(localStorageKey);
  chatMessages.innerHTML = "";
  userList.innerHTML = "";
  if (groupId !== -1)
    document.getElementById(groupId).classList.remove("selected");
  groupId = e.target.id;
  e.target.classList.add("selected");
  try {
    const users = await axios.get(
      `http://localhost:3000/groups/${groupId}/users`
    );
    for (let i = 0; i < users.data.length; i++)
      outputUsersFromGroup(users.data[i]);
  } catch (err) {
    console.log(err);
  }
};

// Periodically fetch new messages from the server (e.g., every 1 seconds)
setInterval(() => {
  const chatMessagesArray =
    JSON.parse(localStorage.getItem(localStorageKey)) || [];
  const lastMessage = chatMessagesArray[chatMessagesArray.length - 1];

  // Use the last message's ID to fetch new messages from the server
  const lastMessageId = lastMessage ? lastMessage.id : -1;
  fetchMessagesFromServer(lastMessageId);
}, 1000);

//logout function
function logout() {
  axios.defaults.headers.common["Authorization"] = `${token}`;
  localStorage.removeItem("token");
  alert("You are logged out successfully");
  window.location.href = "login.html";
}

async function removeUser(e) {
  const confirmation = confirm("Are you sure to remove the selected user");
  if (confirmation) {
    try {
      const result = await axios.delete(
        `http://localhost:3000/groups/${groupId}/user`,
        {
          params: {
            userId: e.target.id,
          },
        }
      );
      if (result.status === 200) e.target.parentNode.remove();
    } catch (err) {
      if (err.response && err.response.status === 406) {
        alert("You can not remove yourself");
      } else if (err.response && err.response.status === 405) {
        alert("You are not an admin");
      } else {
        // Handle other errors here, e.g., network issues
        console.error("An error occurred:", err);
      }
    }
  }
}

async function makeadmin(e) {
  const confirmation = confirm("Are you sure to make the selected user Admin");
  if (confirmation) {
    try {
      const result = await axios.patch(
        `http://localhost:3000/groups/${groupId}/makeadmin`,
        {
          userId: e.target.id,
        }
      );
      if (result.status === 200) {
        userList.innerHTML = "";
        for (let i = 0; i < result.data.length; i++)
          outputUsersFromGroup(result.data[i]);
      }
    } catch (err) {
      if (err.response && err.response.status === 406) {
        alert("You can not remove yourself");
      } else if (err.response && err.response.status === 405) {
        alert("You are not an admin");
      } else {
        // Handle other errors here, e.g., network issues
        console.error("An error occurred:", err);
      }
    }
  }
}