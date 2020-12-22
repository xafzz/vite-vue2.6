import {cached} from "../compiler/helpers.js";

//将 style行内样式 用 {} 包裹起来
export const parseStyleText = cached( cssText => {
    let res = {}
    let listDelimiter = /;(?![^(]*\))/g
    let propertyDelimiter = /:(.+)/
    cssText.split(listDelimiter).forEach(function (item) {
        if (item) {
            const tmp = item.split(propertyDelimiter)
            tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim())
        }
    })
    return res
})