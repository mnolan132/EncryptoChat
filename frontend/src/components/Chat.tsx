import React, { useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import {chatCollection} from "../../../backend/controller";

function Chat() {

  useEffect(() => onSnapshot(chatCollection, (snapshot) => {
    console.log(snapshot, "snapshot");
  }));
  return (
    <div>
      <h2>Chat</h2>
    </div>

  );
}

export default Chat