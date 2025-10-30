import React from 'react'
import { useSelector } from 'react-redux';
import { Outlet , Navigate } from 'react-router-dom';

export default function AdminRoute() {
    const { currentUser, sessionExpiry } = useSelector((state) => state.user);
    const isExpired = sessionExpiry && Date.now() >= sessionExpiry;

    if (!currentUser || isExpired) {
        return <Navigate to='/sign-in' />;
    }

    return currentUser.isUserAdmin === true ? <Outlet /> : <Navigate to='/' />;
}


