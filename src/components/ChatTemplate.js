import React, { useEffect, useState } from 'react';
import '../styles/ChatTemplate.scss'
import { UserBlock } from './UserBlock';
import { Avatar } from './Avatar'
import moment from 'moment'

export const ChatTemplate = () => {
    const URL = 'http://localhost:3001/usersData'

    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState({ myMsg: [], generatedMsg: [] })
    const [myMsgList, setMyMsgList] = useState([])
    const [searchUser, setSearchUser] = useState('')
    const [textMsg, setTextMsg] = useState('')

    useEffect(() => {

        fetchData()
    }, [])

    useEffect(() => {
        const delayFetchData = () => {
            setTimeout(() => {
                fetchData()
            }, [10000])
        }
        delayFetchData();
        return () => {
            clearTimeout(delayFetchData)
        }
    }, [myMsgList])

    useEffect(() => {
        document.querySelector('#msgArea').scrollTop = document.querySelector('#msgArea').scrollHeight
    }, [currentUser.myMsg.length, currentUser.generatedMsg.length, users])


    const fetchData = async () => {

        await fetch(URL, { method: 'GET' })
            .then((res) => res.json())
            .then((res) => {
                const sortedRes = res.sort((a, b) => b.lastMsgTime - a.lastMsgTime)
                setUsers(sortedRes)
                setCurrentUser(res[0])
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const sendMsg = async (e) => {
        setMyMsgList(textMsg)
        await fetch(URL + '/' + currentUser.id,
            {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lastMsgTime: Date.now(),
                    myMsg: [...currentUser.myMsg, { text: textMsg, isSenderMe: true, time: Date.now() }]
                })
            })
            .then(() => {
                setTextMsg('');
                fetchJoke();
                fetchData();
            })
    }

    const fetchJoke = async () => {
        await fetch('https://api.chucknorris.io/jokes/random')
            .then((res) => res.json())
            .then(res => {
                fetch(URL + '/' + currentUser.id,
                    {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            hasNewMsg: true,
                            generatedMsg: [...currentUser.generatedMsg, { text: res.value, isSenderMe: false, time: Date.now() }]
                        }),
                    })
            })
    }

    const onHandleClick = (id) => {
        users.forEach((user) => {
            if (user.id === id) {
                user.hasNewMsg = false;
            }

        })
        fetch(URL + '/' + id,
            {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hasNewMsg: false,
                })
            })


        fetch(URL + '/' + id, { method: 'GET' })
            .then((res) => res.json())
            .then((res) => setCurrentUser(res))
    }

    return <div className="template">
        <div className="l-templ">
            <div className="avatar">
                <Avatar image='images/6.png' name='avatar-img' />
                <div className="search">
                    <i className="fa fa-search icon"></i>
                    <input
                        type="search"
                        placeholder="Search or start new chat"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                    />
                </div>
            </div>
            <div className="chats">
                <div className="header">Chats</div>
                {users.filter((user) => {
                    const name = user.name.toLowerCase()
                    if (searchUser === '') {
                        return user
                    } else if (name.includes(searchUser.toLowerCase())) {
                        return user
                    }
                }).map((user) => {
                    return (
                        <div key={user.id}>
                            <UserBlock user={user} onHandleClick={onHandleClick} />
                        </div>
                    )
                })
                }
            </div>
        </div>
        <div className="r-templ">
            <div className="user-title">
                <Avatar image={currentUser.image ? currentUser.image : users[0]?.image} name='avatar-img' />
                <div>{currentUser.name ? currentUser.name : users[0]?.name}</div>
            </div>
            <div className="messages-area" id="msgArea">
                {(currentUser.myMsg.length || currentUser.generatedMsg.length)
                    ? ([...currentUser.myMsg, ...currentUser.generatedMsg]
                        .sort((a, b) => a.time - b.time)
                        .map(msg => {
                            return <div key={msg.id}>
                                <div className={msg.isSenderMe ? "my-msg-block" : "msg-block"}>
                                    {!msg.isSenderMe
                                        ? <Avatar image={currentUser.image} name='msg-avatar-img' />
                                        : <></>}
                                    <div className="msg" key={msg.id}>
                                        {msg.text}
                                    </div>
                                </div>
                                <div>
                                    <div className={msg.isSenderMe ? "my-time" : "time"}>{`${moment(msg.time).format("L")}, ${moment(msg.time).format("LT")}`}</div>
                                </div>
                            </div>
                        }))
                    : users.length
                        ? ([...users[0].myMsg, ...users[0].generatedMsg]
                            .sort((a, b) => a.time - b.time)
                            .map(msg => {
                                return <div key={msg.id}>
                                    <div className={msg.isSenderMe ? "my-msg-block" : "msg-block"}>
                                        {!msg.isSenderMe
                                            ? <Avatar image={users[0].image} name='msg-avatar-img' />
                                            : <></>}
                                        <div className="msg" key={msg.id}>
                                            {msg.text}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={msg.isSenderMe ? "my-time" : "time"}>{`${moment(msg.time).format("L")}, ${moment(msg.time).format("LT")}`}</div>
                                    </div>
                                </div>
                            }))
                        : <div></div>}
            </div>
            <div className="message-input-block">
                <input placeholder="Type your message"
                    value={textMsg}
                    onChange={(e) => setTextMsg(e.target.value)}
                    onKeyDown={(e) => (e.key === 'Enter' && sendMsg(e))}
                />
                <div>
                    <i className="fa fa-paper-plane icon"
                        onClick={(e) => sendMsg(e)}></i>
                </div>
            </div>
        </div>
    </div>;
};
