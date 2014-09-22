console.log('authorization: [' + global.getUserId() + ':' + global.getToken() + ']');
$.ajaxSetup({
    headers: {
        'Authorization': global.getUserId() + ':' + global.getToken()
    }
});
