
//todo export 与 export default 区别在加深下

export default class Watcher{

    constructor(vm,expOrfn,cb) {
        //这个vm 是 Observer 实例的对象
        //
        this.vm = vm
        // 这里暂时没有函数
        // expOrfn

        this.depIds = new _set()
        this.newDepIds = new _set()
        this.newDeps = []

        // 也是传进来的 没有传 先当false 来用吧
        this.lazy = false
    }

    //最终执行的这个
    get(){

    }

    //收集依赖 到 Dep depend里面 然后 到到这儿
    addDep(dep){
        let id = dep.id
        //不存在
        if(!this.newDepIds.has(id)){
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if( !this.depIds.has(id) ){
                //这儿这个 dep 又回到 Dep 里面的
                dep.addSub(this)
            }
        }
    }

    //依赖通知更新 Dep notify
    //该方法会触发 run
    //肯定要有个删除的操作 要不玩不转转
    update(){
        console.log(111)
        // this.get()
    }


    //最终到 get
    run(){

    }

    //清除队列
    clearupDeps(){

    }
}

export class _set{

    constructor() {
        this.set = Object.create(null)
    }

    has(key){
       return this.set[key] === true
    }

    add(key){
        this.set[key] = true
    }
}