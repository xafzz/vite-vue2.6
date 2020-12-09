// 源码位置：src/core/observer/dep.js

let uid=0
export default class Dep{

    constructor() {
        //唯一id
        this.id = uid++
        //存放依赖
        this.subs=[]
    }

    //添加依赖
    addSub(sub){
        console.log(sub)
        this.subs.push(sub)
    }

    //移除依赖
    removeSub(sub){
        remove(this.subs,sub)
    }

    //也可以直接写到 Dep的原型上 prototype
    //observer defineReactive Object.defineProperty get
    //收集依赖
    depend(){
        //默认是null
        //vue中 挂载 $mount的 时候能获取 哪些是要变的
        //通过 new watcher 这儿 其实就是 watcher 了
        if(Dep.target){
            //Dep.target 是整个 watcher 的实例
            //addDep 就是watcher 里面的 addDep
            Dep.target.addDep(this)
        }
    }

    //observer defineReactive Object.defineProperty set
    //发送依赖
    notify(){
        //依赖发送到 watcher 里面到 update
        //避免改动影响原来到数组
        let subs = this.subs.slice()
        console.log(subs)
        for (let i =0;i < this.subs.length;i++){
            subs[i].update()
        }
    }
}

export function remove(arr,item){
    if( arr.length ){
        //获取下标
        let index = arr.indexOf(item)
        //存在的时候 我才 删除
        if( index > -1 ){
            return arr.slice(index,1)
        }
    }
}

Dep.target = null