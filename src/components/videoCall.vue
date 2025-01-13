<template>
    <div>
        <h2>Video Call</h2>
        local:
        <video ref="localVideo" autoplay muted></video> 
        remote:
        <video ref="remoteVideo" autoplay></video>
        <button @click="startCall">Start Call</button>
        <button @click="joinCall">Join Call</button>
    </div>
</template>
<script setup lang="ts">
    import { ref } from "vue";
    import { database } from '../config/firebase';
    import { doc, setDoc, getDoc, onSnapshot, collection } from "firebase/firestore"; 
    const localVideo:any = ref(null); 
    const remoteVideo:any = ref(null); 
    const localStream:any = ref(null); 
    const peerConnection:any = ref(null);
    const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
    // Function to handle ICE candidates
function handleICECandidateEvent(event) {
  if (event.candidate) {
    const candidateData = {
      candidate: event.candidate.toJSON()
    };
    const candidateDoc = doc(database, "calls", "gameRoomId", "candidates", peerType);
    setDoc(candidateDoc, candidateData, { merge: true });
  }
}

// Function to start the call
const startCall = async () => { 
  const peerType = "caller";
  localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.value.srcObject = localStream.value;
  peerConnection.value = new RTCPeerConnection(servers);

  // Add local stream tracks to the connection
  localStream.value.getTracks().forEach((track) => peerConnection.value.addTrack(track, localStream.value));

  const offer = await peerConnection.value.createOffer();
  await peerConnection.value.setLocalDescription(offer);

  const callDoc = doc(database, "calls", "gameRoomId");
  await setDoc(callDoc, { offer });

  peerConnection.value.onicecandidate = handleICECandidateEvent;

  onSnapshot(callDoc, async (snapshot) => { 
    const data = snapshot.data();
    if (data?.answer && !peerConnection.value.currentRemoteDescription) { 
      const answer = new RTCSessionDescription(data.answer);
      await peerConnection.value.setRemoteDescription(answer);
    }
  });
};

// Function to join the call
const joinCall = async () => { 
  const peerType = "callee";
  const callDoc = doc(database, "calls", "gameRoomId");
  const callSnapshot = await getDoc(callDoc);
  const callData = callSnapshot.data();
  const offer = callData.offer;

  peerConnection.value = new RTCPeerConnection(servers);
  peerConnection.value.ontrack = (event) => { 
    remoteVideo.value.srcObject = event.streams[0];
  };

  localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.value.srcObject = localStream.value;
  localStream.value.getTracks().forEach((track) => peerConnection.value.addTrack(track, localStream.value));

  await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.value.createAnswer();
  await peerConnection.value.setLocalDescription(answer);
  await setDoc(callDoc, { answer }, { merge: true });

  peerConnection.value.onicecandidate = handleICECandidateEvent;
};

// Add listeners for ICE candidates
onSnapshot(collection(database, "calls", "gameRoomId", "candidates"), (snapshot) => {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === "added") {
      const candidateData = change.doc.data();
      if (candidateData.candidate) {
        const candidate = new RTCIceCandidate(candidateData.candidate);
        await peerConnection.value.addIceCandidate(candidate);
      }
    }
  });
});
</script>
<style>
    video {
        width: 300px;
        margin: 10px;
    }
</style>
