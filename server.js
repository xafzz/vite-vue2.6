const koa = require('koa')
const path = require('path')
const fs = require('fs')
//热更新
const chokidar = require('chokidar')

//端口号
const port = 9000

const app =new koa()

//有一些是从node_modules 里面来的 要转成 @module
function writeImport(content){
    return content.replace(/ from ['|"]([^'"]+)['|"]/g,(s0,s1)=>{
        if( s1[0] !=='.' && s1[0] !=='/' ){
            return ` from '/@module/${s1}'`
        }else{
            return s0
        }
    })
}

app.use(async (ctx,next)=>{
    let { url } =ctx
    console.log('url->',url)
    //根目录
    if( url === '/' ){
        let content = fs.readFileSync('./index.html','utf-8')
        //写入文件
        ctx.type = 'text/html'
        ctx.body = content
    }else if( url.endsWith('.js') ){
        //js 文件
        let paths = path.resolve(__dirname,url.slice(1))
        let content = fs.readFileSync(paths,'utf-8')
        ctx.type='application/javascript'
        ctx.body = writeImport(content)
    }else if( url.indexOf('@module') > -1 ){
        let paths = path.resolve(__dirname,url.replace('@module','node_modules').slice(1))
        //找到node_modules 里面的 package.json
        let packAge = require(paths+'/package.json').main
        //拿到里面的内容
        let content = fs.readFileSync(paths+packAge.slice(1),'utf-8')
        ctx.type = 'application/javascript'
        ctx.body = writeImport(content)
    }
    return next()
})

const server = require('http').createServer(app.callback())
const io = require('socket.io')(server);

server.listen(port,()=>{
    console.log(`Listening...${port}`)
})


//监听文件变化
// const watcher = chokidar.watch(['./index.html','./src/main.js'])
const watcher = chokidar.watch('.',{
    ignored:['node_modules','.idea','.git','yarn-error.log','yarn.lock','.gitignore','README.md','package.json'],
    persistent: true
})
let ioSocket;
watcher.on('ready',()=>{
    //初始化 建立链接
    ioSocket = io.on('connection', function (socket) {
        //监听客户端 其实没啥用 完全可以注释掉
        socket.on('client',(data)=>{
            if(data && data.client){
                console.log('client is true')
            }
        })
        return socket
    });
})
//监听change事件
watcher.on('change',(path)=>{
    console.log('change->',path)
    //todo 可以通过获取文件内容对页面进行局部更新，现在是直接刷新页面
    ioSocket.emit('pageChange',{
        path:path,
        server:true,
        client:false
    })
}).on('add',(path)=>{
    console.log('add->',path)
})

