import React from 'react';

export const Avatar = (props) => {
    return <div>
        <img src={props.image} alt="avatar" className={props.name} />
    </div>;
};
