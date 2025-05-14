const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        // Vérifier si l'utilisateur existe déjà dans la base de données
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          // Si l'utilisateur n'existe pas, on le crée
          user = new User({
            email: profile.emails[0].value,
            username: profile.displayName,
            avatar: profile.photos[0].value,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});