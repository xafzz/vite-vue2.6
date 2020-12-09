import Observer from './observer/index.js'
import Dep from "./observer/dep.js";
import dom from './observer/dom.js'
import Watcher from './observer/watcher.js'
/////////////////////////////////


//object
let student = {
    name:'某某',
    sex:'男',
    age:100,
    other:{
        num:1
    }
}
// 将整个对象变成 响应式数据
// Observer类
//相当于直接进行 new Vue
let obj = new Observer(student)

//触发下 get，收集依赖
dom(['name','sex','age'],obj.obj)

//绑定button 事件
dom('addButton').addEventListener('click',()=>{
    student.age ++
    // student.name = '某某' + student.age
})

////////////////////////////////
//将age 变成可以被监听的值
// let age =1
// Object.defineProperty(student,'age',{
//     //
//     get(){
//         console.log('get:',age)
//         return age
//     },
//     set(newVal){
//         console.log('set:',age,newVal)
//         //将操作 html 放到这儿
//         dom('age',newVal)
//         age = newVal
//     }
// })
//
// //绑定button 事件
// dom('addButton').addEventListener('click',()=>{
//         //只操作数据 模版更新
//         student.age ++
// })
// //写入内容 这样写 初始化 有age
// dom(['name','sex','age'],student)
// //这样写 初始化 没有 age
// // dom('age',student.age)
// // console.log('this is main',student)