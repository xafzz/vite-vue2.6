import {remove} from "../../shared/util";
import config from "../config";

let uid = 0

export default class Dep{

    constructor() {
        this.id = uid++
        this.subs = []
    }

    //添加依赖
    addSub(sub){
        console.log('addSub--->',sub)
        this.subs.push(sub)
    }

    //删除依赖
    removeSub(sub){
        console.log('removeSub--->',sub)
        remove(this.subs,sub)
    }

    //收集依赖
    depend(){
        if( Dep.target ){
            console.log('depend----->')
            Dep.target.addDep(this)
        }
    }

    //发送依赖
    notify(){
        // stabilize the subscriber list first
        const subs = this.subs.slice()
        //异步
        if( config.async ){
            // subs aren't sorted in scheduler if not running async
            // we need to sort them now to make sure they fire in correct
            // order
            subs.sort((a, b) => a.id - b.id)
        }
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.


Dep.target = null
const targetStack = []

//src/core/instance/lifecycle.js 里面 callHook
//src/core/instance/state.js initData->getData
export function pushTarget(target){
    targetStack.push(target)
    Dep.target = target
}

export function popTarget(){
    targetStack.pop()
    Dep.target = targetStack[targetStack.length - 1]
}
