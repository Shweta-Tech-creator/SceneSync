const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Extract user info from Google profile
        const googleUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value
        };
        
        return done(null, googleUser);
    } catch (error) {
        console.error('Google OAuth strategy error:', error);
        return done(error, null);
    }
}
));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Extract user info from GitHub profile
        const githubUser = {
            githubId: profile.id,
            displayName: profile.displayName || profile.username,
            username: profile.username,
            email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
            photo: profile.photos?.[0]?.value
        };
        
        return done(null, githubUser);
    } catch (error) {
        console.error('GitHub OAuth strategy error:', error);
        return done(error, null);
    }
}
));

module.exports = passport;
