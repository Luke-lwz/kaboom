const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const alphanumeric = alphabet + numbers;


export function idGenAlphabet(length = 4, exclude = []) {
    let str = "";
    for (let i = 0; i < length; i++) {
        let r = rng(0, alphabet.length - 1);
        str = str + alphabet[r];
    }
    if (exclude.length < 200 && exclude.includes(str)) return idGenAlphabet(length, exclude);
    return str;
}




export function rng(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is included and the minimum is included  
}