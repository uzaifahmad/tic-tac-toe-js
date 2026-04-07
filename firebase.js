// Initialize Firebase app
export function initFirebase(config) {
  try {
    window.firebase.initializeApp(config);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Create a new room with host player
export async function createRoom(roomId, hostPlayer) {
  try {
    const db = window.firebase.database();
    const initialState = {
      board: Array(9).fill(null),
      turn: 'X',
      players: { X: hostPlayer },
      status: 'waiting'
    };
    await db.ref(`rooms/${roomId}`).set(initialState);
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

// Join existing room as guest player
export async function joinRoom(roomId, guestPlayer) {
  try {
    const db = window.firebase.database();
    await db.ref(`rooms/${roomId}/players/O`).set(guestPlayer);
    await db.ref(`rooms/${roomId}/status`).set('playing');
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}

// Make a move on the board
export async function makeMove(roomId, index, symbol, nextTurn) {
  try {
    const db = window.firebase.database();
    const updates = {};
    updates[`rooms/${roomId}/board/${index}`] = symbol;
    updates[`rooms/${roomId}/turn`] = nextTurn;
    await db.ref().update(updates);
  } catch (error) {
    console.error('Error making move:', error);
    throw error;
  }
}

// Listen for room state changes, return function to turn off listener
export function listenRoom(roomId, callback) {
  try {
    const db = window.firebase.database();
    const ref = db.ref(`rooms/${roomId}`);
    ref.on('value', (snapshot) => {
      callback(snapshot.val());
    });
    // Return a function to turn off the listener
    return () => ref.off('value');
  } catch (error) {
    console.error('Error setting up listener:', error);
    return () => {};
  }
}

// Reset board for rematch
export async function setRematch(roomId) {
  try {
    const db = window.firebase.database();
    const updates = {};
    updates[`rooms/${roomId}/board`] = Array(9).fill(null);
    updates[`rooms/${roomId}/turn`] = 'X';
    updates[`rooms/${roomId}/status`] = 'playing';
    await db.ref().update(updates);
  } catch (error) {
    console.error('Error setting rematch:', error);
    throw error;
  }
}

// Set up disconnect cleanup for player
export function removePlayer(roomId, symbol) {
  try {
    const db = window.firebase.database();
    db.ref(`rooms/${roomId}/players/${symbol}`).onDisconnect().remove();
  } catch (error) {
    console.error('Error setting up disconnect cleanup:', error);
  }
}
