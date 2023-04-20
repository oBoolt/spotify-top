import "dotenv/config";
import express, { Request, Response } from "express";
import passport from "passport";
import session from "express-session";
import jsonFile, { UserType } from "./utils/jsonFile";
import open from "open";
import getTopTracks from "./utils/getTopTracks";
import { join } from "path";
import sleep from "./utils/sleepFunction";

const app = express();
const PORT = process.env.PORT || 5000;
const API_LINK = "https://api.spotify.com/v1";
const USER_ID = process.argv[2] ?? null;
const PLAYLIST_ID = process.argv[3] ?? null;
const LIMIT = process.argv[4] ?? "50";
const TIME_RANGE: "short_term" | "medium_term" | "long_term" | string =
  process.argv[5] ?? "short_term"; // short_term | medium_term | long_term

const users: UserType[] = jsonFile.loadJSON(join(process.cwd(), "users.json"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 60 * 24 * 7 },
  })
);
app.use(passport.initialize());
app.use(passport.session());
require("./utils/strategy");

app.get(
  "/",
  passport.authenticate("spotify"),
  (req: Request, res: Response) => {
    console.log(req.query);
    res.status(200).send({ success: true, query: req.query });
  }
);

app.get("/close", (req: Request, res: Response) => {
  res.send("<script>window.close()</script>");
});

app.get("/update", (req: Request, res: Response) => {
  res.status(200).send({ token: req.headers.authorization });
});

app.get(
  "/redirect",
  passport.authenticate("spotify"),
  (req: Request, res: Response) => {
    res.redirect("/close");
  }
);

(async () => {
  if (USER_ID === null || PLAYLIST_ID === null) {
    console.log(
      "Usage: 'npm start <user_id> <playlist_id> [limit] [time_range]'"
    );
    return;
  }

  if (parseInt(LIMIT) <= 0 || parseInt(LIMIT) > 50 || isNaN(parseInt(LIMIT))) {
    console.log("The 'limit' must be a number between 1 and 50");
    return;
  }

  console.log(
    `Limit: ${LIMIT} \nUser Id: ${USER_ID} \nPlaylist Id: ${PLAYLIST_ID}`
  );
  const currentUser: UserType | undefined = users.find((e) => e.id === USER_ID);

  let server = app.listen(PORT, async () => {
    if (!currentUser) {
      open(`http://localhost:${PORT}`);
      await sleep(1000 * 60); // 1 minute
      await server.close();
    }
  });

  if (currentUser) {
    await getTopTracks(
      USER_ID,
      API_LINK,
      users,
      PLAYLIST_ID,
      parseInt(LIMIT),
      TIME_RANGE
    );
    process.exit(0);
  }
})();
