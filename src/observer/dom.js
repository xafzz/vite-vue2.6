import Dep from "./dep.js";
import Watcher from "./watcher.js";

export default function dom(id,html=''){
    if( html ){

        //是否是数组
        if( Array.isArray(id) ){
            id.forEach(val=>{
                //正常不是这么走
                //在这儿假定 数据会操作 都添加到watcher 里面
                //全局watcher 是在 $mount 的时候 new
                Dep.target = new Watcher(val)
                document.querySelector(`#${val}`).innerHTML=html[val]
            })
        }else{
            //正常不是这么走
            //在这儿假定 数据会操作 都添加到watcher 里面
            //全局watcher 是在 $mount 的时候 new
            Dep.target = new Watcher(id)
            // console.log(id,html)
            document.querySelector(`#${id}`).innerHTML=html
        }
    }else{
        // let addButton = document.querySelector('#addButton')
        //main.js:21 Uncaught TypeError: Cannot read property 'addEventListener' of null
        // let addButton = document.getElementById('#addButton')
        return document.querySelector(`#${id}`)
    }
}