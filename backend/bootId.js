// A fresh random id generated once, the first time this module is
// required after the Node process starts — require()'s module cache
// makes it a per-process singleton. It's embedded in every login JWT
// (see routes/auth.js) and checked in authMiddleware/chatbot's
// optionalAuth: a token carrying an older bootId means it was issued by
// a previous server process, so it's rejected.
//
// Net effect: restarting the backend (`npm run dev` / `node server.js`)
// invalidates every previously-issued token at once — every logged-in
// user has to log in again.
const crypto = require('crypto');

module.exports = crypto.randomBytes(8).toString('hex');
