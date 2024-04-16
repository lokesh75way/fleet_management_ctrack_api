import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import createError from "http-errors";
import User, { UserRole, IUser } from "../schema/User";
import jwt from "jsonwebtoken";

export const initPassport = (): void => {
  passport.use(
    new Strategy(
      {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token, done) => {
        try {
          const admin = await User.findOne({
            _id: token.user.id,
          });
          if (admin?.isDeleted == true) {
            return done(
              createError(
                401,
                "Your account has been deleted! Please contact admin"
              ),
              false
            );
          }
          const userRole = token?.user?.role;
          if (Object.values(UserRole).includes(userRole) && admin) {
            return done(null, admin as IUser);
          }

          if (!admin) throw new Error("User not found!");

          // return done(null, user);
          done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  // user signup
  passport.use(
    "signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (request, email, password, done) => {
        try {
          const { firstName } = request.body as IUser;
          const existUser = await User.findOne({ email });
          if (existUser != null) {
            done(createError(403, "User already exist!"));
            return;
          }
          const user = await User.create({ name, email, password });
          done(null, user);
        } catch (error: any) {
          done(createError(500, error.message));
        }
      }
    )
  );

  // user login
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({
            $or: [{ email: email }, { userName: email }],
          }).select(
            "_id password isDeleted isActive email role type firstName lastName userName"
          );
          if (user == null) {
            done(createError(401, "User not found"), false);
            return;
          }
          if (user.isDeleted) {
            done(
              createError(
                401,
                "Your account has been deleted! Please contact admin"
              ),
              false
            );
            return;
          }

          if (!user.isActive) {
            done(
              createError(
                401,
                "Your account is inactive! Please contact admin"
              ),
              false
            );
            return;
          }
          const validate = await user.isValidPassword(password);
          if (!validate) {
            done(createError(401, "Invalid email or password"), false);
            return;
          }

          // user['password'] = ""
          done(null, user, { message: "Logged in Successfully" });
        } catch (error: any) {
          done(createError(500, error.message));
        }
      }
    )
  );
};

export const generateToken = (data: any) => {
  const tokenData = {
    id: data._id,
    role: data?.role,
    type: data?.type,
  };
  const jwtSecret = process.env.JWT_SECRET ?? "";
  const token = jwt.sign({ user: tokenData }, jwtSecret);

  const user = data;
  user["password"] = "";

  return {
    user,
    token,
  };
};

export const generatePasswordToken = (user: IUser) => {
  const tokenData = {
    id: user._id,
  };
  const jwtSecret = process.env.JWT_SECRET ?? "";
  const token = jwt.sign({ user: tokenData }, jwtSecret);

  return token;
};

export const verifyPasswordToken = (token: string) => {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  const verify = jwt.verify(token, jwtSecret);
  return verify;
};
