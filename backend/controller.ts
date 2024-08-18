import {collection, getFirestore} from 'firebase/firestore';
import { app } from "./firebase";

export const firestore = getFirestore(app)

//Chat collection
export const chatCollection = collection(firestore, 'chat')