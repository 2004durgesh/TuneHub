export function resizeImageUrl(url, width = 2000, height = 2000) {
    if (!url) {
        return ''; // return a default image URL or an empty string
    }
    return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);

}