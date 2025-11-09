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
