export function hexToHsl(hex) {
    // Convert hex to HSL
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1));

        switch (max) {
            case r:
                h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
                break;
            case g:
                h = ((b - r) / delta + 2) * 60;
                break;
            case b:
                h = ((r - g) / delta + 4) * 60;
                break;
        }
    }

    return [h, s * 100, l * 100];
}

export function hslToHex(hsl) {
    // Convert HSL to hex
    const h = hsl[0] / 360;
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;

    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
}

export function interpolateColor(color1, color2, percentage, rotateDirection = 1) {
    const hsl1 = hexToHsl(color1);
    const hsl2 = hexToHsl(color2);

    // Adjust the interpolation for hue rotation direction
    const hueDiff = (hsl2[0] - hsl1[0] + 360 * rotateDirection) % 360;
    const interpolatedHue = (hsl1[0] + hueDiff * percentage / 100 + 360) % 360;

    const interpolatedHsl = [interpolatedHue, hsl1[1] + (hsl2[1] - hsl1[1]) * percentage / 100, hsl1[2] + (hsl2[2] - hsl1[2]) * percentage / 100];

    return hslToHex(interpolatedHsl);
}