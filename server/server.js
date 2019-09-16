const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/message');
const {
    isRealString
} = require('./utils/validation');
const {
    Users
} = require('./utils/users');

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use((req, res, next) => {
    if (req.query.token && req.query.userId && req.path === '/chat.html' && req.method == 'GET') {
        console.log(req.query)
        let request = http.get({
            host: global.NODE_ENV === 'development' ? 'localhost' : 'sso-example-auth-server.herokuapp.com',
            path: '/api/v1/auth/' + req.query.userId,
            port: global.NODE_ENV === 'development' ? 8080 : 80,
            headers: {
                'Authorization': 'Bearer ' + req.query.token,
                "Content-Type": "application/json",
            },
        }, function (response) {
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                if (JSON.parse(chunk).status !== '200 OK') { 
                    res.redirect('/unauthorized.html');
                }
                else {
                    console.log("yeah")
                    next();
                }
            });
        })

        request.end();
    } else next()
})

app.use(express.static(publicPath));

app.get('/logout', (req, res) => {
    let request = http.request({
        method: 'DELETE',
        path: '/api/v1/auth/',
        host: global.NODE_ENV === 'development' ? 'localhost' : 'sso-example-auth-server.herokuapp.com',
        port: global.NODE_ENV === 'development' ? 8080 : 80,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + req.query.token,
        },

    }, function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            chunk = JSON.parse(chunk)
            if (chunk.status !== "200 OK") {
                res.redirect('/')
            } else {
                res.redirect(`/`)
            }
        });
    })

    request.end()
})

app.post('/chat.html', (req, res) => {
    console.log(req.body)
    let {
        name,
        password,
        room
    } = req.body;
    let request = http.request({
        method: 'POST',
        path: '/api/v1/auth/',
        host: global.NODE_ENV === 'development' ? 'localhost' : 'sso-example-auth-server.herokuapp.com',
        port: global.NODE_ENV === 'development' ? 8080 : 80,
        headers: {
            "Content-Type": "application/json",
        },

    }, function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            chunk = JSON.parse(chunk)
            if (chunk.status !== "200 OK") {
                res.redirect('/')
            } else {
                let {
                    token,
                    user
                } = chunk.data;
                let {
                    email,
                    id
                } = user;
                res.redirect(`/chat.html?name=${email}&room=${room}&userId=${id}&token=${token}`)
            }
        });
    })

    request.write(JSON.stringify({
        email: name,
        password
    }))

    request.end()
})

io.on('connection', (socket) => {
    socket.on('createMessage', function (msg, callback) {
        let user = users.getUser(socket.id);

        if (user && isRealString(msg.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, msg.text));
        }
    });

    socket.on('join', (params, callback) => {
        let room = params.room ? params.room.toLowerCase() : '';
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required.');
        }

        let sameName = users.getUserList(room).filter(user => user.toLowerCase() == params.name ? params.name.toLowerCase() : '').length;

        if (sameName > 0) {
            return callback('Username Taken');
        }

        socket.join(room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, room);

        io.to(room).emit('updateUserList', users.getUserList(room));
        socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room} Chatroom`));

        socket
            .broadcast
            .to(room)
            .emit('newMessage', generateMessage('Admin', `${params.name} has joined the room.`));
        callback();
    })

    socket.on('createLocationMessage', (coords) => {
        let user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    })

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the room`));
        }
    })
})

server.listen(port, () => {
    console.log(`Started on port ${port}`);
});