import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
// @ts-ignore — exported from the RN bundle but not in the default TS typings
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCwNIaVw6tnmlBsYU8zZzEI7aareCsR1yo',
  authDomain: 'treequest-65b8f.firebaseapp.com',
  projectId: 'treequest-65b8f',
  storageBucket: 'treequest-65b8f.firebasestorage.app',
  messagingSenderId: '131091322115',
  appId: '1:131091322115:web:b4fda27924967786c4c536',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
