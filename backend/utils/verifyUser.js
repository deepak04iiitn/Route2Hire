import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req , res , next) => {

    const token = req.cookies.access_token;

    if(!token)
    {
        return next(errorHandler(401 , 'Please sign in to continue!'));
    }

    jwt.verify(token , process.env.JWT_SECRET , (err , user) => {
        if(err)
        {
            return next(errorHandler(401 , 'Please sign in to continue!'));
        }
        req.user = user;
        next();
    })
}

export const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.isUserAdmin !== true) {
        return next(errorHandler(403, 'Admins only'));
    }
    next();
}