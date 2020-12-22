import {
    makeMap
} from "../compiler/helpers.js";

// attributes that should be using props for binding
let acceptValue=makeMap('input,textarea,option,select,progress')

export const mustUseProp = (tag, type, attr) =>{
    return (
        ( attr === 'value' && acceptValue(tag)) && type !== 'button' ||
        ( attr === 'selected' && tag === 'option') ||
        ( attr === 'checked' && tag === 'input' ) ||
        ( attr === 'muted' && tag === 'video' )
    )
}