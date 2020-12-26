const koa = require('koa')
const path = require('path')
const fs = require('fs')
//热更新
const chokidar = require('chokidar')

const vueTemplateCompiler = require('vue-template-compiler')

//端口号
const port = 9000

const app =new koa()

/**
 *  @/vue     ./vue/index.js
 *  @vue        ./vue/index.js
 *  ./vue       ./vue/index.js
 */
//有一些是从node_modules 里面来的 要转成 @module
const isFit = new RegExp('@')
function writeImport(content,initUrl){
    return content.replace(/ from ['|"]([^'"]+)['|"]/g,(s0,s1)=>{
        //当有 @ 存在当时候
        if( isFit.test(s1) ){
            s1 = s1.replace(/@(\/)?/,'@/')
        }

        if( s1[0] !=='.' && s1[0] !=='/' ){
            return ` from '/@module/${s1}'`
        }else if( s1[0] === '.' && s1[1] === '/' ){     // ./
            // console.log('-------->s0,s1',s0,'<------>',s1,'---->',initUrl,'s1[0]->',s1[0],'s1[1]->',s1[1],` from '${initUrl.replace('src','@module')}${s1.slice(1)}'`)
            return ` from '${initUrl.replace('src','@module')}${s1.slice(1)}'`
        }else if( s1[0] === '.' && s1[1] === '.' && s1[2] === '/' ){     // ../
            //这个应该正则出来 可能会有../../ 但是这种情况 就用 @ 代替了
            //只要存在 ../ 且 不管有多少 ../
            let s1Arr = s1.split('..\/')
            // 源码里面用到了很多 不如实际情况自己用一次
            s1Arr = s1Arr.filter( n => n )
            // console.log(initUrl,'----->',s1Arr.join('\/'))
            //当存在 ../ 的时候 都是从 src 下面 开始的
            // return ` from '${initUrl.replace('src','@module')}/${s1Arr.join('\/')}'`
            /////////////
            //根据 ../ 个数
            let numArr = s1.match(/\.\.\//g)
            //将当前路径 分成数组
            let pathArr = initUrl.split('\/')

            if( numArr.length > pathArr.length ){

                console.log('\033[41;30m Error \033[41;37m not found \033[40;33m '+initUrl+ s1 +' \033[0m')
            }else{
                //不去空
                pathArr.splice(-numArr.length,numArr.length)
                return ` from '${pathArr.join('\/')}/${s1Arr.join('\\/')}'`
            }
        } else{
            return s0
        }
    })
}
// @ 表示 src/
const src = path.resolve(__dirname,'src')
const pathObject = Object.create(null)
//里面只有@module 而不是 @module/@/的时候
const isOnlyModel = '/@module/'
function resolveExtensions(url){
    //后面可以搞个单独的文件 这个文件里面的都是 .vue
    if( url !== '/' && url !== '/src/main.js' ){
        //判断是否有 @ ，有@ url 变为 /@module/@/
        url = url.replace(/^\/@module\/@[\/]?/,'/')
        //是否包含后缀名 文件名不包含 .
        let arr = url.split('.')
        //有 . 就认为是有后缀名的
        // console.log('first----->url:',url,arr.length,arr)arr
        if( arr.length === 1 ){
            //
            //里面只有@module 而不是 @module/@/的时候
            if( new RegExp(isOnlyModel).test(url) ){
                url=url.replace(isOnlyModel,'/')
            }

            let file
            /*
                fs.stat 异步
                fs.stat(src + url,(err,data)=>{
                    //如果是文件夹
                    if( data && data.isDirectory() && !data.isFile() ){
                        //直接匹配 index.js  或者 index.vue
                        isExists( url,'/index' )
                    }else{
                        console.log(11)
                        isExists( url )
                    }
                })
            */
            try {
                file='/index'
                //文件夹
                fs.statSync(src + url)
                isExists( url,file )
                // console.log('second----->url:',url,pathObject[url])url
            }catch (e) {
                file=''
                //非文件夹
                isExists( url,file )
            }
            //如果object长度为
            switch ( Object.keys(pathObject[url]).length ) {
                case 2 :
                    url = '/src'+pathObject[url]['.js']
                    break
                case 1 :
                    url = pathObject[url][ Object.keys(pathObject[url])[0] ]
                    break
                case 0 :
                    console.log('\033[41;30m Error \033[41;37m not found \033[40;33m src'+url+file+'.js 或 src'+url+file+'.vue \033[0m')
                    break
            }
            // console.log('four------>url:',url,path.resolve(__dirname, url.slice(1)))
        }else{
            // url = '/src/'+url
            //处理过一次了啊？
            // console.log('three------>url:',url,path.resolve(__dirname, url.slice(1)))
            url = url.replace(/^\/@module\//,'/src/')
            // console.log(url)
        }
    }
    return url
}
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
            pathObject[url][ext] = '/src'+url + file + ext
        }catch (err){
            // pathObject[url][ext] = false
        }
    } )
    // fs.access( file,fs.constants.F_OK,(err)=> !err )
}

app.use(async (ctx,next)=>{
    let { url,type } =ctx
    let initUrl = url
    //todo 每次都走了 这个地方可以 搞个缓存 只有添加文件的时候 过一遍路径 其他情况直接就好了
    url = resolveExtensions(url)
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
            // console.log('---------->',initUrlArr,newUrl)
        }catch (e) {
            console.warn('------->',initUrl)
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
        // console.log(parseContent)

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
})

