// Thin wrapper around Socket.IO so any route file can emit a real-time
// event without needing to know about the underlying HTTP server.
//
// Usage:
//   const { initSocket, emitToAdmin } = require('../socket');
//   initSocket(httpServer);           // once, in server.js
//   emitToAdmin('appointment:new', {...});   // from any route

let io = null;

function initSocket(httpServer) {
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // The admin dashboard joins this room on mount so it only receives
    // events relevant to it (not every connected browser tab).
    socket.on('join:admin', () => {
      socket.join('admin');
    });

    socket.on('disconnect', () => {
      // Nothing to clean up — Socket.IO removes the socket from all
      // rooms automatically.
    });
  });

  console.log('Socket.IO initialised');
  return io;
}

// Emits an event to every connected admin-dashboard client.
// Safe to call even if a socket somehow isn't connected — it just no-ops
// instead of throwing, so a missing/late socket connection never breaks
// the underlying HTTP request that triggered the event.
function emitToAdmin(event, payload) {
  if (!io) return;
  io.to('admin').emit(event, payload);
}

module.exports = { initSocket, emitToAdmin };