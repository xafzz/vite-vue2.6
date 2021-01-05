
import {handleError} from "./error";

export let isUsingMicroTask = false

const callbacks = []
let pending = false


// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).

//在这里，我们使用微任务异步延迟包装器。
// 在2.5中，我们使用了（宏）任务（结合了微任务）。
// 但是，当状态在重新绘制之前更改状态时（例如6813，由内而外的转换），
// 它存在一些细微的问题。
// 另外，在事件处理程序中使用（宏）任务会导致一些无法规避的怪异行为（例如7109、7153、7546、7834、8109）。
// 因此，我们现在再次在各处使用微任务。
// 这种折衷的主要缺点是，
// 在某些情况下，微任务的优先级过高
// ，并且在假定的顺序事件之间（例如4521、6690，它们具有解决方法）
// 甚至在同一事件冒泡之间都会触发（6566）。

let timerFunc


/**
 *
 * @param cb { ? Function }
 * @param ctx { ? Object }
 */
export function nextTick( cb,ctx ){
    console.log('暂时写上了 之前也用过很多次 等到实例跑的时候 再来详细打印')
    //这是那个异步吗 this.$nextTick
    let _resolve
    callbacks.push(()=>{
        if( cb ){
            try {
                cb.call(ctx)
            }catch (e){
                handleError(e,ctx,'nextTick')
            }
        }else if(_resolve){
            _resolve(ctx)
        }
    })

    if( !pending ){
        pending = true
        timerFunc()
    }

    if( !cb && typeof Promise !== 'undefined' ){
        return new Promise(resolve => {
            _resolve = resolve
        })
    }
}
