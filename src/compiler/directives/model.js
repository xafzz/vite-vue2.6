
import { addHandler,getBindingAttr,addProp } from '../helpers.js'
import {no} from "../../shared/util.js";

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
//将各个的v-model 搞出来

let config = {
    isReservedTag:no
}
let RANGE_TOKEN = '__r'
let CHECKBOX_RADIO_TOKEN = '__c'

// vue/dist/vue.esm.js  7327
    /**
     *
     * @param el 就是 input的ast
     * @param dir 如下

     <input type="text" id="input" class="input" name="input" value="这是默认值"  v-model="msg" />
     dirs:
     {
        arg: false,
        isDynamicArg: undefined,
        modifiers:{
            end: 199,
            name: "v-model",
            start: 186,
            value: "msg",
        },
        name: "model",
        rawName: "msg",
        value: "msg",
    }

     codegen/generate.js -> genDirectives()
 */
//@todo modifiers.number 是什么啊
export default function model(el,dir){

    let value = dir.value
    let modifiers = dir.modifiers
    let tag = el.tag
    let type = el.attrsMap.type


    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if( tag === 'input' && type === 'file' ){
        console.warn(
            `<${el.tag} v-model="${value}" type="file">:File inputs are read only. Use a v-on:change listener instead.`
        )
    }
    if( el.element ){
        console.warn('没有----->el.element')
    }else if( tag === 'select' ){
        genSelect(el, value, modifiers)
    }else if( tag === 'input' && type === 'checkbox' ){
        genCheckboxModel(el, value, modifiers)
    }else if(tag === 'input' && type === 'radio') {
        genRadioModel(el, value, modifiers);
    }else if( !config.isReservedTag( tag ) ){
        genComponentModel(el, value, modifiers)
        // component v-model doesn't need extra runtime
        //组件v-model不需要额外的运行时间
        return false
    }else{
        console.warn(
            `<${el.tag} v-model="${value}">: ` +
            `v-model is not supported on this element type. ` +
            'If you are working with contenteditable, it\'s recommended to ' +
            'wrap a library dedicated for that purpose inside a custom component.',
            el.rawAttrsMap['v-model']
        )
    }
    //确保运行时指令元数据
    return true
}

// select
function genSelect( el,value,modifiers ){
    let number = modifiers && modifiers.number
    let selectedVal = `Array.prototype.filter` +
        `.call($event.target.options,function(o){return o.selected})` +
        `.map(function(o){var val = "_value" in o ? o._value : o.value;` +
        `return ${number ? '_n(val)' : 'val'}})`

    let assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]'
    let code = `var $$selectedVal = ${selectedVal};`
    code = `${code} ${genAssignmentCode(value, assignment)}`
    //v-bind
    addHandler(el, 'change', code, null, true)
}

function genCheckboxModel( el,value,modifiers ){
    /**
     * <input type="checkbox" id="checkbox" class="input" name="input" value="1" v-if="1" v-on:click="tag" v-model="msg" v-for="item in 10">
     *   arg: null
         end: 296
         isDynamicArg: false
         modifiers: undefined
         name: "model"
         rawName: "v-model"
         start: 283
         value: "msg"
     */
    let number = modifiers && modifiers.number
    // valueBinding
    let valueBinding = getBindingAttr(el, 'value') || 'null'
    let trueValueBinding = getBindingAttr(el, 'true-value') || 'true'
    let falseValueBinding = getBindingAttr(el, 'false-value') || 'false'


    addProp(el, 'checked',
        "Array.isArray(" + value + ")" +
        "?_i(" + value + "," + valueBinding + ")>-1" + (
            trueValueBinding === 'true'
                ? (":(" + value + ")")
                : (":_q(" + value + "," + trueValueBinding + ")")
        )
    )

    addHandler(el, 'change',
        "var $$a=" + value + "," +
        '$$el=$event.target,' +
        "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
        'if(Array.isArray($$a)){' +
        "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
        '$$i=_i($$a,$$v);' +
        "if($$el.checked){$$i<0&&(" + (genAssignmentCode(value, '$$a.concat([$$v])')) + ")}" +
        "else{$$i>-1&&(" + (genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')) + ")}" +
        "}else{" + (genAssignmentCode(value, '$$c')) + "}",
        null, true
    )
}

function genRadioModel (el, value, modifiers) {
    let number = modifiers && modifiers.number
    let valueBinding = getBindingAttr(el, 'value') || 'null'
    valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding
    addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"))
    addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true)
}

function genComponentModel(el, value, modifiers){
    let { number,trim } = modifiers || {}

    let baseValueExpression = '$$v'
    let valueExpression = baseValueExpression
    if (trim) {
        valueExpression =
            `(typeof ${baseValueExpression} === 'string'` +
            `? ${baseValueExpression}.trim()` +
            `: ${baseValueExpression})`
    }
    if (number) {
        valueExpression = `_n(${valueExpression})`
    }
    //msg=$$v
    let assignment = genAssignmentCode(value, valueExpression)

    el.model = {
        value: `(${value})`,
        expression: JSON.stringify(value),
        callback: `function (${baseValueExpression}) {${assignment}}`
    }
}

function genAssignmentCode(value,assignment){
    let res = parseModel(value)
    //v-model="msg"
    //res  {exp: "msg", key: null}
    if( res.key === null ){
        return `${value}=${assignment}`
    }else{
        return `$set(${res.exp}, ${res.key}, ${assignment})`
    }
}

/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */

let len, str, chr, index, expressionPos, expressionEndPos

function parseModel( val ){
    // allow v-model="obj.val " (trailing whitespace)
    val = val.trim()
    len = val.length

    //v-model="msg.e"
    if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
        let index = val.lastIndexOf('.')
        if (index > -1) {
            return {
                exp: val.slice(0, index),
                key: '"' + val.slice(index + 1) + '"'
            }
        } else {
            return {
                exp: val,
                key: null
            }
        }
    }

    str = val
    index = expressionPos = expressionEndPos = 0
    //todo 下面的就不知道什么意思了
    while (!eof()) {
        chr = next()
        // /* istanbul ignore if */
        // 34 39 什么意思
        if (isStringStart(chr)) {
            parseString(chr)
        } else if (chr === 0x5B) {
            parseBracket(chr)
        }
    }

    return {
        exp: val.slice(0, expressionPos),
        key: val.slice(expressionPos + 1, expressionEndPos)
    }
}

function eof(){
    return index >= len
}
function next(){
    return str.charCodeAt(++index)
}
function isStringStart(chr){
    //ASCII码表在线查询
    //https://www.litefeel.com/tools/ascii.php
    // 34 39
    return chr === 0x22 || chr === 0x27
}

function parseBracket (chr) {
    let inBracket = 1
    expressionPos = index
    while (!eof()) {
        chr = next()
        if (isStringStart(chr)) {
            parseString(chr)
            continue
        }
        if (chr === 0x5B) inBracket++
        if (chr === 0x5D) inBracket--
        if (inBracket === 0) {
            expressionEndPos = index
            break
        }
    }
}

function parseString (chr) {
    const stringQuote = chr
    while (!eof()) {
        chr = next()
        if (chr === stringQuote) {
            break
        }
    }
}