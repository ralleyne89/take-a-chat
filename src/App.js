import './App.css';
// FIREBASE SDK
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore';
// FIREBASE HOOKS
import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'
import { useRef, useState } from 'react';

firebase.initializeApp({
  // CONFIGURATION FROM FIREBASE SITE
  apiKey: "AIzaSyA3CcknBoCE1NqYxJNRM_fKKXhCjcp34O0",
    authDomain: "taking-a-chat.firebaseapp.com",
    projectId: "taking-a-chat",
    storageBucket: "taking-a-chat.appspot.com",
    messagingSenderId: "1053893187449",
    appId: "1:1053893187449:web:ea22be095427d80f4501a8",
    measurementId: "G-C151810KH6"
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
  const [user] = useAuthState(auth)
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom/> : <SignIn/>}</section>
    </div>
  );
}

 const SignIn = () => {
  const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider()
      auth.signInWithPopup(provider)
  }
  return(
      <>
      <button onClick={signInWithGoogle}>Sign In with Google</button>
      </>
  )
}

const SignOut = () => {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

 const ChatRoom = () => {
   // SELECTING REFERENCE FROM FIRESTORE COLLECTION
   const messagesRef = firestore.collection('messages')
   // CREATING THE ORDER OF THE QUEUE MESSAGES W/ LIMIT
   const query = messagesRef.orderBy('createdAt').limit(25)
   // MESSAGES HOOK
   const [messages] = useCollectionData(query, {idField: 'id'})
   // FORM VALUE HOOK
  const [formValue, setFormValue] = useState('')
  const dummy = useRef()
  // FUNCTION TO HANDLE SENDING A MESSAGE
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    // CREATING NEW DOCUMENT TO FIREBASE
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid, 
      photoURL: photoURL || null
    })
    setFormValue('');
    // MAKE THE MESSAGE SCROLL TO BOTTOM OF THE PAGE WHEN SENT
    dummy.current.scrollIntoView({behavior: 'smooth'})
  }

  return(
      <>
        <main>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={dummy}></div>
          </main>
        {/* WRITE VALUE TO FIRESTORE */}
        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
          <button type='submit'>Submit</button>
        </form>
      </>
  )
}

const ChatMessage = (props) => {
  const {text, uid, photoURL} = props.message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return(
    <div className={`message ${messageClass}`}>
      {console.log('auth.currentUser: ', auth.currentUser.photoURL)}
      <img src={photoURL} alt=""/>
      <p>{text}</p>
    </div>
  )
}

export default App;
