export function getRandomIP() {
    return Array.from(Array(4)).map(() => parseInt(Math.random() * 255 + '')).join('.')
}

export function bitToKB(bit: number){
    return  (bit/1024).toFixed(2)
}

export function ensureCh(str: string, ch:string = "/"){
    if(str.endsWith(ch)){
        return str
    }
    return `${str}${ch}`
}