import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const newRoomId = `room-${Math.random().toString(36).substr(2, 8)}`;
    navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Chat App</h1>
      <button onClick={handleCreateRoom}>Create Room</button>
      <br />
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        style={{ marginTop: '10px', marginRight: '5px' }}
      />
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
};

export default Home;