export function serializeBigInt(obj: any): any {
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
    }
    if (obj !== null && typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = serializeBigInt(obj[key]);
            }
        }
        return result;
    }
    return obj; // primitive (string, number, boolean, null, undefined)
}

export function scale(a: number | bigint, factor: number): bigint {
    if (typeof a === 'bigint') {
        return a * BigInt(10 ** factor);
    }
    return BigInt(a * 10 ** factor);
}

export function descale(a: bigint, factor: number): number {
    return Number(a) / 10 ** factor;
}

export function normalize(a: bigint, factor: number): bigint {
    return a / BigInt(10 ** factor);
}

export const fixedScale = 10n ** 8n;
export const fixedScaleExponent = 8;

export function pow(
    base: bigint,
    exponent: bigint
): { value: bigint; scale: bigint } {
    if (exponent < 0n) {
        throw new Error('Negative exponents are not supported for bigint pow');
    }

    let result = fixedScale; // Represents 1.0 in fixed-point math
    let b = base;
    let e = exponent;

    while (e > 0n) {
        if (e & 1n) {
            result = (result * b) / fixedScale;
        }
        b = (b * b) / fixedScale;
        e >>= 1n;
    }

    return { value: result, scale: fixedScale };
}
