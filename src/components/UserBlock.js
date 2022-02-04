import React from 'react';
import '../styles/UserBlock.scss'
import { Avatar } from './Avatar'
import moment from 'moment';

export const UserBlock = ({ user, onHandleClick, a }) => {
    return <div
        className={user.hasNewMsg ? "user-block newMsg" : "user-block"}
        onClick={() => onHandleClick(user.id)}
    >
        <Avatar image={user.image} name='avatar-img' />
        <div className="name">
            {user.name}
        </div>
        <div className="date">
            {moment(new Date(user.dateOfJoin)).format("MMM Do YY")}
        </div>

    </div>;
};
