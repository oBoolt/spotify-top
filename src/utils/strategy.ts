import { writeFile } from "fs";
import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { join } from "path";
import jsonFile, { UserType } from "./jsonFile";

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
const users: UserType[] = jsonFile.loadJSON(join(process.cwd(), "users.json"));

passport.serializeUser((user: any, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await users.find((e) => e.id === id);
    return user ? done(null, user) : done(null, false);
  } catch (err) {
    console.log(err);
    return done(err, false);
  }
});

passport.use(
  new SpotifyStrategy(
    {
      clientID: CLIENT_ID!,
      clientSecret: CLIENT_SECRET!,
      callbackURL: REDIRECT_URI!,
      scope: [
        "playlist-modify-public",
        "playlist-modify-private",
        "user-top-read",
      ],
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      let existingUser = users.find((e) => e.id == profile.id);
      if (existingUser !== undefined) {
        return done(null, existingUser!);
      }
      const newUser = {
        id: profile.id,
        accessToken,
        refreshToken,
        expires_in,
      };
      users.push(newUser);
      jsonFile.saveJSON(join(process.cwd(), "users.json"), users);
      done(null, newUser);
    }
  )
);
