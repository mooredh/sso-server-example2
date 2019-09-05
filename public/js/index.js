var params = JSON.parse(localStorage.getItem('sso-auth'))

if (params) {
    let { name, room, userId, token } = params;
    window.location.href = `/chat.html?name=${name}&room=${room}&userId=${userId}&token=${token}`
}