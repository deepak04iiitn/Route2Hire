import React from 'react'
import { useSelector } from 'react-redux';
import { Outlet , Navigate, useLocation } from 'react-router-dom';

export default function AdminRoute() {
    const { currentUser, sessionExpiry } = useSelector((state) => state.user);
    const location = useLocation();
    const isExpired = sessionExpiry && Date.now() >= sessionExpiry;

    if (!currentUser || isExpired) {
        return <Navigate to={`/sign-in?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />;
    }

    return currentUser.isUserAdmin === true ? <Outlet /> : <Navigate to='/' />;
}


