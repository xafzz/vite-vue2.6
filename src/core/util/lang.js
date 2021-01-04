



/**
 * Check if a string starts with $ or _
 * 字符开头是否以$ or _
 */
export function isReserved (str) {
   const c = (str + '').charCodeAt(0)
   return c === 0x24 || c === 0x5F
}
