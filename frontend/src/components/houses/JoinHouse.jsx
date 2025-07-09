import { useState } from 'react';
import api from '../../services/api';

export default function JoinHouse() {
  const [code, setCode] = useState('');
  const handleJoin = async () => {
    await api.post('/houses/join_house/', { invite_code: code });
    window.location.reload();
  };
  return (
    <div>
      <input value={code} onChange={e => setCode(e.target.value)} placeholder="Invite Code" />
      <button onClick={handleJoin}>Join House</button>
    </div>
  );
}