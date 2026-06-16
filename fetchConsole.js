// POST -----------------------------------------------------------
fetch("http://localhost:3000/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Vle",
    age: 25,
    email: "vlevle@gmail.com",
    password: "Vle111@@$",
  }),
})
  .then((res) => res.json())
  .then((res) => console.log(res));

// PUT -----------------------------------------------------------

fetch("http://localhost:3000/api/users/2", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Jack",
    age: 20,
    email: "jackjack@gmail.com",
    password: "Jack111$",
  }),
})
  .then((res) => res.json())
  .then((res) => console.log(res));

// PATCH -----------------------------------------------------------

fetch("http://localhost:3000/api/users/2", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "John" }),
})
  .then((res) => res.json())
  .then((res) => console.log(res));

// DELETE -----------------------------------------------------------

fetch("http://localhost:3000/api/users/2", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((res) => console.log(res));
