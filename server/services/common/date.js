module.exports.now = function() {
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    const h = today.getHours();
    const i = today.getMinutes();
    const s = today.getSeconds();
    const str = yyyy + '-' + mm + '-' + dd + ' ' + h + ':' + i + ':' + s;
    return str;
}
