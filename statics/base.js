var 
    base = function (op) {
    op = op || {};
    var socket = io(document.location.origin);
    //替代函数
    function replace() { console.log(arguments); }
    //消息
    socket.on('message', op.message || replace);
    //数据
    socket.on('dataset', op.dataset || replace);
    //刷新
    socket.on('reset', op.reset || replace);
    //登录
    socket.on('login', op.login || replace);
    //设置
    socket.on('setting', op.setting || replace);
    //回调
    socket.on('callback', function (fn, data) {
        fn = (typeof fn == 'function'?fn:function () { });
        fn(data);
    });
    
    //获取数据
    function dataset(data) {
        socket.emit('dataset', data);
    }
    //登录
    function login(data) {
        socket.emit('login', data);
    }
    //重置
    function reset(data) {
        socket.emit('reset', data);
    }
    //设置
    function setting(data) {
        socket.emit('setting', data);
    }
    
    return {
        //获取数据
        dataset: dataset,
        //登录
        login: login,
        //重置
        reset: reset,
        //设置
        setting: setting
    }
}