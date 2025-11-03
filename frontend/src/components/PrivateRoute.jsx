import React from 'react'
import { useSelector } from 'react-redux';
import { Outlet , Navigate, useLocation } from 'react-router-dom';


export default function PrivateRoute() {

    const { currentUser, sessionExpiry } = useSelector((state) => state.user);
    const isExpired = sessionExpiry && Date.now() >= sessionExpiry;
    const location = useLocation();

  return currentUser && !isExpired
    ? <Outlet />
    : <Navigate to={`/sign-in?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />;          // outlet will be pointing to the children of PrivateRote , i.e , dashboard
}