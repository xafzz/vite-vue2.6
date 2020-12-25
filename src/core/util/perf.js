import {inBrowser} from "./env.js";


export let mark
export let measure

/**
 *  window.performance
 *  IE9和chrome6以上的版本都支持
 *  Web Performance API允许网页访问某些函数来测量网页和Web应用程序的性能
    https://developer.mozilla.org/zh-CN/docs/Web/API/Window/performance

 */

//没有生产
const perf = inBrowser && window.performance

if(
    perf &&
    perf.mark &&            //通过一个给定的名称，将该名称作为健和对应的 DOMHighResTimeStamp 作为值保存在一个哈希结构里，改健值对表示了从某一时刻到记录时刻间隔的毫秒数
    perf.measure &&         //
    perf.clearMarks &&
    perf.clearMeasures
){
    mark = tag => perf.mark(tag)
    measure = ( name,startTag,endTag ) => {
        perf.measure( name,startTag,endTag )
        perf.clearMarks( startTag )
        perf.clearMarks( endTag )
        // perf.clearMeasures(name)
    }
}

