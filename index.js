const fs = require("fs").promises;
const path = require("path");
const http = require("http");
const {
  createPath,
  headerGenerator,
  defaultResGenerator,
} = require("./helpers");
const PORT = 3000;

const server = http.createServer(async (req, res) => {
  if (req.url === "/") {
    return defaultResGenerator(res, "text/html", ["pages"], "index.html", 200);
  }

  if (req.url.match(/^\/api\/users\/([0-9]+)$/) && req.method === "GET") {
    const id = Number(req.url.split("/").pop());

    const users = JSON.parse(
      await fs.readFile(createPath("db", "users.json"), "utf-8"),
    );

    const currentUser = users.find((user) => user.id === id);

    headerGenerator(200, "application/json", res);
    res.write(JSON.stringify(currentUser || null));
    return res.end();
  }

  if (req.url === "/api/users" && req.method === "GET") {
    const users = JSON.parse(
      await fs.readFile(createPath("db", "users.json"), "utf-8"),
    );

    headerGenerator(200, "application/json", res);
    res.write(JSON.stringify(users));
    return res.end();
  }

  if (req.url === "/api/users" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      const parsedBody = JSON.parse(body);

      const users = JSON.parse(
        await fs.readFile(createPath("db", "users.json"), "utf-8"),
      );

      if (
        parsedBody.name.trim() !== "" &&
        parsedBody.age >= 18 &&
        parsedBody.age <= 65 &&
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          parsedBody.password,
        ) &&
        ["gmail.com", "mail.ru", "mail.com"].includes(
          parsedBody.email.split("@").pop(),
        ) &&
        !users.some((user) => user.email === parsedBody.email)
      ) {
        const fixedName =
          parsedBody.name.charAt(0).toUpperCase() + parsedBody.name.slice(1);

        const newUser = {
          id: Date.now(),
          name: fixedName,
          age: parsedBody.age,
          email: parsedBody.email,
          password: parsedBody.password,
        };

        users.push(newUser);

        await fs.writeFile(
          createPath("db", "users.json"),
          JSON.stringify(users),
        );

        headerGenerator(200, "application/json", res);
        res.write(JSON.stringify(newUser));
        return res.end();
      } else {
        headerGenerator(400, "application/json", res);
        res.write(JSON.stringify({ message: "Something Went Wrong" }));
        return res.end();
      }
    });

    return;
  }

  if (req.url.match(/^\/api\/users\/([0-9]+)$/) && req.method === "PUT") {
    const id = Number(req.url.split("/").pop());

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      const parsedBody = JSON.parse(body);

      const users = JSON.parse(
        await fs.readFile(createPath("db", "users.json"), "utf-8"),
      );

      const index = users.findIndex((u) => u.id === id);

      if (index === -1) {
        headerGenerator(400, "application/json", res);
        res.write(JSON.stringify({ message: "User not found" }));
        return res.end();
      }

      if (
        parsedBody.name?.trim() !== "" &&
        parsedBody.age >= 18 &&
        parsedBody.age <= 65 &&
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          parsedBody.password,
        ) &&
        ["gmail.com", "mail.ru", "mail.com"].includes(
          parsedBody.email?.split("@").pop(),
        ) &&
        !users.some((user) => user.email === parsedBody.email && user.id !== id)
      ) {
        const fixedName =
          parsedBody.name.charAt(0).toUpperCase() + parsedBody.name.slice(1);

        users[index] = {
          id,
          name: fixedName,
          age: parsedBody.age,
          email: parsedBody.email,
          password: parsedBody.password,
        };
      } else {
        headerGenerator(400, "application/json", res);
        res.write(JSON.stringify({ message: "Something Went Wrong" }));
        return res.end();
      }

      await fs.writeFile(createPath("db", "users.json"), JSON.stringify(users));

      headerGenerator(200, "application/json", res);
      res.write(JSON.stringify(users[index]));
      res.end();
    });

    return;
  }

  if (req.url.match(/^\/api\/users\/([0-9]+)$/) && req.method === "PATCH") {
    const id = Number(req.url.split("/").pop());

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      const parsedBody = JSON.parse(body);

      const users = JSON.parse(
        await fs.readFile(createPath("db", "users.json"), "utf-8"),
      );

      const index = users.findIndex((u) => u.id === id);

      if (index === -1) {
        headerGenerator(404, "application/json", res);
        res.write(JSON.stringify({ message: "User not found" }));
        return res.end();
      }

      const user = users[index];

      if (parsedBody.name !== undefined) {
        if (parsedBody.name.trim() === "") {
          headerGenerator(400, "application/json", res);
          res.write(JSON.stringify({ message: "Invalid name" }));
          return res.end();
        }
        user.name =
          parsedBody.name.charAt(0).toUpperCase() + parsedBody.name.slice(1);
      }

      if (parsedBody.age !== undefined) {
        if (parsedBody.age < 18 || parsedBody.age > 65) {
          headerGenerator(400, "application/json", res);
          res.write(JSON.stringify({ message: "Invalid age" }));
          return res.end();
        }
        user.age = parsedBody.age;
      }

      if (parsedBody.email !== undefined) {
        const domain = parsedBody.email.split("@").pop();

        if (
          !["gmail.com", "mail.ru", "mail.com"].includes(domain) ||
          users.some((u) => u.email === parsedBody.email && u.id !== id)
        ) {
          headerGenerator(400, "application/json", res);
          res.write(JSON.stringify({ message: "Invalid or duplicate email" }));
          return res.end();
        }

        user.email = parsedBody.email;
      }

      if (parsedBody.password !== undefined) {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(parsedBody.password)) {
          headerGenerator(400, "application/json", res);
          res.write(JSON.stringify({ message: "Weak password" }));
          return res.end();
        }

        user.password = parsedBody.password;
      }

      users[index] = user;

      await fs.writeFile(
        createPath("db", "users.json"),
        JSON.stringify(users, null, 2),
      );

      headerGenerator(200, "application/json", res);
      res.write(JSON.stringify(user));
      return res.end();
    });

    return;
  }

  if (req.url.match(/^\/api\/users\/([0-9]+)$/) && req.method === "DELETE") {
    const id = Number(req.url.split("/").pop());

    const users = JSON.parse(
      await fs.readFile(createPath("db", "users.json"), "utf-8"),
    );

    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      headerGenerator(404, "application/json", res);
      res.write(JSON.stringify({ message: "User not found" }));
      return res.end();
    }

    const deletedUser = users.splice(index, 1)[0];

    await fs.writeFile(
      createPath("db", "users.json"),
      JSON.stringify(users, null, 2),
    );

    headerGenerator(200, "application/json", res);
    res.write(
      JSON.stringify({
        message: "User deleted from db",
        user: deletedUser,
      }),
    );
    return res.end();
  }

  return defaultResGenerator(res, "text/html", ["pages"], "error.html", 404);
});

server.listen(PORT, (err) => {
  err ? console.log(err) : console.log("Server Is Running");
});
