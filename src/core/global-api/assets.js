
import {ASSET_TYPES} from "../../shared/constants";


export function initAssetRegisters( Vue ){
    /**
     * Create asset registration methods.
     */
    ASSET_TYPES.forEach( type=>{
        Vue[ type ] = function ( id,definition ){
            console.log('哪儿用到了---->initAssetRegisters')
        }
    } )

}
