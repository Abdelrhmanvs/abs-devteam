const express = require("express");
require("dotenv").config();
const app = express();
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const cors = require("cors");
const PORT = process.env.PORT || 3500;
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const path = require("path");

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(logger);
app.use(cookieParser());
app.use(cors(corsOptions));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log(process.env.NODE_ENV);

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/requests", require("./routes/reportRoutes"));

app.all("*", (req, res) => {
  res.status(404).json({ message: "404 not found" });
});
app.use(errorHandler);
// Database connection
connectDB(); // Database confoguration function

mongoose.connection.once("open", () => {
  console.log(`connected to mongo db`);
  app.listen(PORT, () => console.log(`sever running on port ${PORT}`));
});
mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no} : ${err.code} : ${err.syscall} ${err.hostname} `,
    "mongoerrorlog.log"
  );
});
// app.listen(PORT,()=>console.log(`sever running on port ${PORT}`))
//use the upper code if you want to use the server without data base and comment the code line of mongoose and connectDB() => function
