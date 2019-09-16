window.onload = function () {
    var params;
    xdLocalStorage.init(
        {
            /* required */
            iframeUrl:'https://sso-example-server.herokuapp.com/storage.html',
            //an option function to be called right after the iframe was loaded and ready for action
            initCallback: function () {
                console.log('Got iframe ready, idx');

                xdLocalStorage.getItem('sso-auth', function(data) {
                    params = data;
                    console.log(params)

                    if (params.value) {
                        params = JSON.parse(params.value);
                        let { name, room, userId, token } = params
                        window.location.href = `/chat.html?name=${name}&room=${room}&userId=${userId}&token=${token}`
                    }
                });
            }
        }
    );
}
