import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../models/user.model.js";
import { compare } from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const customFields = {
  usernameField: "identifier",
  passwordField: "password",
};

passport.use(
  new LocalStrategy(customFields, async (identifier, password, done) => {
    try {
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });
      if (!user) {
        return done(null, false, { message: "Incorrect username or email." });
      }

      const valid = await compare(password, user.password as string);
      if (!valid) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
