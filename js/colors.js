
// first thing: display these values.
// better text colors.

// get luminance

function hhLum(hexhex) {
    // from http://www.w3.org/TR/WCAG20/#relativeluminancedef
    let sRGB = parseInt(hexhex, 16) / 255;
    return (sRGB <= 0.03928) ? sRGB/12.92 : Math.pow((sRGB+0.055)/1.055, 2.4);
}

function relativeLuminanceW3C(htmlColorCode) {
    // assuming htmlColorCode is #xxxxxx where x is hexadecimal (0-9 or a-f).
    return 0.2126 * hhLum(htmlColorCode.slice(1, 3)) +
        0.7152 * hhLum(htmlColorCode.slice(3, 5)) +
        0.0722 * hhLum(htmlColorCode.slice(5, 7));
}

function textColor(htmlColorCode) {
    if (relativeLuminanceW3C(htmlColorCode) > 0.5) {
        return "#0f0f0f";
    } else {
        return "#f0f0f0";
    }
}