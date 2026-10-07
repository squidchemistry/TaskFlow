const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const prisma = require('../lib/prisma');
const config = require('../lib/config');

if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: `${config.SERVER_URL.replace(/\/$/, '')}/api/auth/google/callback`,
        // Proxy-aware — Render sets X-Forwarded-Proto
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email returned from Google'));

          // Find existing user by googleId OR email (link accounts)
          let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: profile.id }, { email }] },
          });

          if (user) {
            // Link Google to an existing local account if not already linked
            if (!user.googleId) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  googleId: profile.id,
                  avatarUrl: user.avatarUrl || profile.photos?.[0]?.value,
                },
              });
            }
          } else {
            user = await prisma.user.create({
              data: {
                fullName: profile.displayName || email.split('@')[0],
                email,
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value,
              },
            });
          }

          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

module.exports = passport;
