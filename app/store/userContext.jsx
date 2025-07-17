import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [updateUser, setUpdateUser] = useState(true);

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(async (user) => {
            if (user) {
                const userData = await fetchUserData(user.phoneNumber);
                setUser(userData);
            }
            setInitializing(false);
        });

        return subscriber;
    }, [updateUser]);

    const fetchUserData = async (phoneNumber) => {
        try {
            const usersRef = firestore().collection('users');
            const querySnapshot = await usersRef.where('phoneNumber', '==', phoneNumber).get();
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                console.log("doc.id", doc.id);
                return { id: doc.id, ...doc.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, setUpdateUser, updateUser, initializing }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext)
};
