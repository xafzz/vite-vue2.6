

//window 在小程序里面 就没有window对象 但是在这儿都是ture吧
export const inBrowser = typeof window !== 'undefined'


// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
//因为之前可能需要vue，所以需要延迟评估
//vue服务器呈现程序可以设置vue_ENV
let _isServer
export function isServerRendering(){
    if( _isServer === undefined ){
        _isServer = false
    }
    return _isServer
}









