import { setDoc, doc, getDoc } from 'firebase/firestore'
import { database } from '../config/firebase'

export const updateProfile = async (
  userId: string,
  name: string,
  email: string,
) => {
  console.log(name, userId)
  debugger
  try {
    await setDoc(doc(database, 'users', userId), {
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
    })
    console.log('User data saved successfully!')
  } catch (error) {
    console.log('error saving user data: ', error)
  }
}

export const fetchUserById = async (userId: string) => {
  const userDocRef = doc(database, 'users', userId)
  const userDoc = await getDoc(userDocRef)
  debugger

  if (userDoc.exists()) {
    console.log('User data:', userDoc.data())
    return userDoc.data()
  } else {
    console.log('No such user!')
    return null
  }
}
