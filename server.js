const koa = require('koa')
const path = require('path')
const fs = require('fs')
//热更新
const chokidar = require('chokidar')
const vueTemplateCompiler = require('vue-template-compiler')
//端口号
const port = 9000
const app =new koa()

// @ 表示 src/ 定义了根目录 这不能动
//这个可以是通过配置进来的，然后通过正则 得到根目录名称
const staticRoot = 'src'
const src = path.resolve(__dirname,staticRoot)
const pathObject = Object.create(null)
//里面只有@module 而不是 @module/@/的时候
const isOnlyModel = '/@module/'
/**
 *  @/vue     ./vue/index.js
 *  @vue        ./vue/index.js
 *  ./vue       ./vue/index.js
 */
//有一些是从node_modules 里面来的 要转成 @module
const isFit = new RegExp('@')
//只有英文字母跟点 必须是开头
const isOnlyLetter = /^([a-zA-Z]+)(\.)?([a-zA-Z]+)?$/
//是否有2个点 必须是开头  ./../ | ../ | /../
const isDoubleSpot = /^(\.\/\.\.\/|\.\.\/|\/\.\.\/)/
//开头包含 ./ /
const isSlashSpot = /^(\.\/|\/)/

//处理路径
function writeImport(content,initUrl){
    return content.replace(/ from ['|"]([^'"]+)['|"]/g,(s0,s1)=>{
        try {
            let returnImport
            //有没有 @ ，有 @
            if( isFit.test( s1 ) ){
                //这个简单 将 @替换了
                // returnImport = ` from '${s1.replace(/^(\/ |\.\/)?@(\/)?/,'/@module/')}'`
                returnImport = s1.replace(/^(\/ |\.\/)?@(\/)?/,'/@module/')
            }else{
                /*
                    App.vue

                    /App.vue
                    ./App.vue

                    ../App.vue
                    ./../App.vue
                    ../App.vue
                    /../App.vue
                    ../../App.vue
                 */
                //App.vue
                // 包含 ../ ,有种特殊情况  目录里面点
                if( isDoubleSpot.test(s1) ){
                    //需要先把 ./  /去掉 ,只剩下 ../xx 或者 ../../xxx
                    let newS1 = s1.replace(isSlashSpot,'')
                    //根据 ../ 切割 数组
                    let newS1Arr = newS1.split('..\/')
                    //获取 ../ 个数 需要将路径进行拼接 这里以 src 当作根目录
                    let count = newS1.match(/\.\.\//g)
                    //将数组 去空 得到最终数组
                    // 源码里面用到了很多 不如实际情况自己用一次
                    newS1Arr = newS1Arr.filter( n => n )
                    //将当前路径 分成数组
                    let pathArr = initUrl.split('\/')
                    //去空一下 有可能 传过来的路径是 /xx 而不是 xx
                    pathArr = pathArr.filter( n=>n )
                    if( pathArr.length > count.length ){
                        pathArr.splice(-count.length,count.length)
                        let newImport = pathArr.join('\/')+ '/' +newS1Arr.join('\/')
                        // returnImport = ` from '${newImport.replace('src','/@module')}'`
                        returnImport = newImport.replace('src','/@module')
                    }else{
                        console.log('\033[41;30m Error \033[41;37m not found \033[40;33m '+initUrl+ s1 +' \033[0m')
                    }
                }else{
                    //开头包含 ./ 或者 /
                    if( isSlashSpot.test(s1) ){
                        //这种情况 是当前路径下的地址 所以这个点 也要主要
                        //如果是 src 下面的 就是 直接 @module
                        //如果是子目录下面的 ./ 就需要包含当前的路径了
                        //不着急替换成最终的 先进行拼接
                        // s1 = s1.replace(isSlashSpot,'/@module/')
                        s1 = initUrl + s1.replace(isSlashSpot,'/')

                        // returnImport = ` from '${s1.replace(staticRoot,'@module')}'`
                        returnImport = s1.replace(staticRoot,'@module')
                    }else if( isOnlyLetter.test(s1) ){
                        // returnImport = ` from '/@module/${s1}'`
                        returnImport = `/@module/${s1}`
                    }else{
                        //其他点情况 都报错
                        console.log('\033[41;30m Error \033[41;37m not found \033[40;33m '+ s0 +','+ s1 +' \033[0m')
                    }
                }
            }
            //修改的时候 直接 输出
            if( !confUrl.getUrl(returnImport) ){
                confUrl.setUrl(returnImport)
            }
            return ` from '${returnImport}'`
        }catch (e) {
            //不要打印错误
        }
    })
}
//包一下
function urlCache(){
    let cached = {}
    return {
        setUrl:function (url){
            let init = url
            //后面可以搞个单独的文件 这个文件里面的都是 .vue
            if( url !== '/' && url !== '/src/main.js' ){
                //里面有@module
                if( new RegExp(isOnlyModel).test(url) ){
                    url=url.replace(isOnlyModel,'/')
                }
                //是否包含后缀名 文件名不包含 .
                let arr = url.split('.')
                //有 . 就认为是有后缀名的
                if( arr.length === 1 ){
                    /*
                        fs.stat 异步
                        fs.stat(src + url,(err,data)=>{
                            //如果是文件夹
                            if( data && data.isDirectory() && !data.isFile() ){
                                //直接匹配 index.js  或者 index.vue
                                isExists( url,'/index' )
                            }else{
                                isExists( url )
                            }
                        })
                    */
                    let file
                    try {
                        file='/index'
                        //文件夹
                        fs.statSync(src + url)
                        isExists( url,file )
                    }catch (e) {
                        file=''
                        //非文件夹
                        isExists( url,file )
                    }
                    //如果object长度为
                    switch ( Object.keys(pathObject[url]).length ) {
                        case 2 :
                            url = pathObject[url]['.js']
                            break
                        case 1 :
                            url = pathObject[url][ Object.keys(pathObject[url])[0] ]
                            break
                        case 0 :
                            console.log('\033[41;30m Error \033[41;37m not found \033[40;33m '+url+file+'.js 或 '+url+file+'.vue \033[0m')
                            break
                    }
                }
                url = '/' + staticRoot + url
            }
            cached[init]=url


            //检测文件是否存在
            function isExists( url,file ) {
                let exists = ['.js','.vue']
                pathObject[url] = Object.create({})
                // pathObject[url] = Object.create(null)
                // pathObject[url] = []
                //感觉像是数组方便 但是 有个问题 当key=0 没有时，key=1 长度有，数组长度为2
                exists.forEach( ext =>{
                    try {
                        fs.accessSync(src + url + file + ext ,fs.constants.F_OK)
                        // pathObject[url].push(url + index + ext)
                        pathObject[url][ext] = url + file + ext
                    }catch (err){
                        // pathObject[url][ext] = false
                    }
                } )
            }
        },
        getUrl:function (url){
            return cached[url]
        }
    }
}

//缓存下
const confUrl = urlCache()

app.use(async (ctx,next)=>{

    let { url,type } =ctx
    let initUrl = url
    //这就可以直接取 不用每次修改文件都要重新执行下
    url = confUrl.getUrl(url) ? confUrl.getUrl(url) : url

    if( url === '/' ){
        let content = fs.readFileSync('./index.html','utf-8')
        //写入文件
        ctx.type = 'text/html'
        ctx.body = content
    }else if( url.endsWith('.js') ) {
        //js 文件
        let paths = path.resolve(__dirname, url.slice(1))
        let content = fs.readFileSync(paths, 'utf-8')

        // 当时初始url 是 文件名的时候
        // 需要获取他所在的目录
        let newUrl
        try {
            fs.statSync(paths)
            let initUrlArr=url.split('\/')
            initUrlArr.pop()
            newUrl = initUrlArr.join('\/')
        }catch (e) {
            newUrl = initUrl
        }
        ctx.type = 'application/javascript'
        ctx.body = writeImport(content,newUrl)
    }else if( url.indexOf('@module') > -1 ){
        let paths = path.resolve(__dirname,url.replace('@module','node_modules').slice(1))
        //找到node_modules 里面的 package.json
        let packAge = require(paths+'/package.json').main
        //拿到里面的内容
        let content = fs.readFileSync(paths+packAge.slice(1),'utf-8')
        ctx.type = 'application/javascript'
        ctx.body = writeImport(content)
    }else if( url.indexOf('.vue') > -1 ){
        //获取路径
        let p = path.resolve(__dirname,url.split('?')[0].slice(1))
        // 文件内容
        let content = fs.readFileSync(p,"utf-8")
        //看看走到哪儿了 node_modules/vue-template-compiler/build.js:336:33
        // let content = fs.readFileSync(p)
        let parseContent = vueTemplateCompiler.parseComponent(content)

        ctx.type = 'application/javascript'
        ctx.body = `
const template = \`${parseContent.template.content}\`
${parseContent.script.content.replace('export default','const script=')}
export default{
    template,
    script
}
        `
        //
        // if( url.indexOf('?type=template') === -1 ){
        //     //写 js 在写 template
        //     ctx.type='application/javascript'
        //     ctx.body = `
        //         ${content.script.content.replace('export default','const _script=')}
        //         import _render from '${url}?type=template'
        //         _script.render = _render
        //         export default _script
        // `
        // }else{
        //     ctx.type='application/javascript'
        //     ctx.body =`
        //         export default function _render(){
        //             return \`${content.template.content}\`
        //         }
        //     `
        // }

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
                // console.log('client is true')
            }
        })
        return socket
    });
})
//监听change事件
watcher.on('change',(path)=>{
    console.log('change->',path)
    // todo 可以通过获取文件内容对页面进行局部更新，现在是直接刷新页面
    ioSocket.emit('pageChange',{
        path:path,
        server:true,
        client:false
    })
}).on('add',(path)=>{
    // console.log('add->',path)
    //
})

