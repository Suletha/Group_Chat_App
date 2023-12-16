// Put DOM elements into variables
const myForm = document.querySelector("#my-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const phoneInput = document.querySelector("#phone");
const msg = document.querySelector(".msg");

// Listen for form submit
myForm.addEventListener("submit", onSubmit);

async function onSubmit(e) {
  e.preventDefault();
  // Create new details object
  const newDetails = {
    name: nameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
    phone: phoneInput.value,
  };
  console.log(newDetails);

  try {
    // post to backend using axios
    const response = await axios.post(
      "http://localhost:3000/users/signUp",
      newDetails
    );
    console.log(response.data);
    // Clear fields
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    passwordInput.value = "";
    // window.location.href = "login.html";
  } catch (err) {
    msg.classList.add("error");
    msg.textContent = "User Already exists";
    setTimeout(() => {
      msg.textContent = "";
      msg.classList.remove("error");
    }, 2000);
  }
}