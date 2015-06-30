var 
    http = require('http'),
    express = require('express'),
    app = express(),
    io = require('socket.io'),
    reptile = require('./server/reptile.js'),
    server = {
        admin: null
    };

//网页内容
app.use(express.static(__dirname + '/statics'));
app.get(reptile.readConfig().setting.admin.url, function (req, res) {
    res.sendFile(__dirname + '/client/' + reptile.readConfig().setting.admin.url + '.html');
});
app.get(/.+\.js|.+\.css/, function (req, res) {
    var 
        url = req.url;
    if (url.indexOf('.css') > -1) {
        res.sendFile(__dirname + '/client/base.css');
    } else if (url.indexOf('.js') > -1) {
        res.sendFile(__dirname + '/client/base.js');
    }
});
app.get(/.+/, function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

//socket内容
io = io(http.createServer(app).listen(3000));
console.warn('【服务器已启动(端口:3000)】');

io.on('connection', function (socket) {
    console.warn("*【接入】[ID: " + socket.id + ' ][ip ' + socket.handshake.address + " ]链接爬虫!");
    socket.emit('message', '已连接爬虫【' + socket.id + '】');
    //消息
    socket.on('message', function (data) {
        console.warn(data);
    });
    //获取数据
    socket.on('dataset', function (id, callback) {
        console.warn('【' + socket.id + '】请求数据！');
        socket.emit('message', '抓取中……');
        reptile.dataset(id, function (data) {
            socket.emit('dataset', data);
            if (data.length > 0) { socket.emit('message', '抓取完成'); } else { socket.emit('message', '服务器未抓去数据.'); }
            
        });
    });
    //邮件
    socket.on('sendmail', function (data) {
        reptile.sendMail(function (data) {
            socket.emit('message', data);
        });
    });
    /*
    * 重置
    * 重新获取爬虫数据
    * data<id,callback> 
    * id:指定重置配置id
    * callback:回调
    */
    socket.on('reset', function (id) {
        console.warn('【' + socket.id + '】重置数据！');
        if (socket.id != server.admin) { socket.emit('message', '服务器已记录你的操作,请等待管理员上线刷新!'); return false; }
        reptile.reset(id, function (data) {
            socket.emit('message', data.message);
        }, function (data) {
            socket.emit('reset');
        });
    });
    //登录
    socket.on('login', function (data) { 
        var 
            config = reptile.readConfig();
        if (data.name == config.setting.admin.name && data.key == config.setting.admin.key) {
            console.log("【****】检测到管理员登录成功.");
            server.admin = socket.id;
            socket.emit('message', '登录成功');
            socket.emit('login', { state: true });
        } else {
            console.log("【****】检测到管理员登录失败.");
            socket.emit('message', '登录失败！');
            socket.emit('login', { state: false, message: '输入的帐号或密码错误!' });
        }
    });
    //设置
    socket.on('setting', function (op) {
        if (socket.id == server.admin) {
            reptile.setting(op, function (data) {
                if (data.state) {
                    console.warn('【获取配置文件成功】');
                    data.data.setting.admin.key = "";
                    socket.emit('message', data.message);
                    socket.emit('setting', {
                        state: true,
                        data: data.data,
                        message: data.message
                    });
                } else {
                    console.warn('【获取配置文件失败】');
                    socket.emit('message', "获取配置文件失败!");
                    socket.emit('setting', {
                        state: false,
                        message: data.message
                    });
                }
            });
        } else { 
            socket.emit('setting', {
                state: false,
                message: "无权操作!"
            });
        }
    
    });
});
