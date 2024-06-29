import cors from "cors";
import express from "express";

import eventsRoutes from "./routes/events";
import loginRoutes from "./routes/login";
import usersRoutes from "./routes/users";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// app.use("/events", eventsRoutes);
// app.use("/login", loginRoutes);
app.use("/users", usersRoutes);

app.listen(port, () => {
  console.log(`Server Started at Port: ${port}`);
});
