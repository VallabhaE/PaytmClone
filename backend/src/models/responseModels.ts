function Success(msg: string) {
    return {
        status : true,
        msg
    }
}

function SuccessAny(msg: any) {
    return {
        status : true,
        msg
    }
}




function FailedAny(msg: any) {
    return {
        status : false,
        msg
    }
}


export {FailedAny,Success,SuccessAny}