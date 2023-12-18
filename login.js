// Put DOM elements into variables
const myForm = document.querySelector("#my-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const msg = document.querySelector(".msg");

// Listen for form submit
myForm.addEventListener("submit", onSubmit);

async function onSubmit(e) {
  e.preventDefault();
  // Create new details object
  const userDetails = {
    email: emailInput.value,
    password: passwordInput.value,
  };

  console.log(userDetails);

  try {
    // post to backend using axios
    const response = await axios.post(
      "http://localhost:3000/users/logIn",
      userDetails
    );
    console.log(response.data);

    //storing token to local storage
    localStorage.setItem("token", response.data.token);

    // Clear fields
    emailInput.value = "";
    passwordInput.value = "";

    window.location.href = "chat.html";
  } catch (err) {
    if (err.response.status === 404) {
      msg.classList.add("error");
      msg.textContent = "User doesn't exist";
    } else if (err.response.status === 401) {
      msg.classList.add("error");
      msg.textContent = "Incorrect password";
    }
    setTimeout(() => {
      msg.textContent = "";
      msg.classList.remove("error");
    }, 2000);
  }
}