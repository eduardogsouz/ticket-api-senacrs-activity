import cors from "cors";
import express from "express";

import ticketsRoutes from "./routes/tickets";
import loginRoutes from "./routes/login";
import usersRoutes from "./routes/users";

const app = express();
const port = process.env.NODE_LOCAL_PORT;

app.use(cors());
app.use(express.json());

app.use("/tickets", ticketsRoutes);
app.use("/login", loginRoutes);
app.use("/users", usersRoutes);

app.listen(port, () => {
  console.log(`Server Started at Port: ${port}`);
});
