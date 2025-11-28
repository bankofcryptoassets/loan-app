import { EMIResult } from '../types/insurance.js';
import { fixedScale, pow } from './bigint.js';

export function calculateEMI(
    principal: bigint,
    r: bigint,
    n: bigint,
    principalDecimals: number,
    rDecimals: number
): EMIResult {
    if (r === 0n) {
        const descale = 10n ** BigInt(principalDecimals);
        return { emi: principal / n, descaleFactor: descale };
    }

    // 1 + r in fixed-point: scale is r's scale
    const onePlusR = fixedScale + r;

    // Calculate (1+r)^n with exact scale tracking
    const powResult = pow(onePlusR, n);
    const powValue = powResult.value;
    const powScale = powResult.scale;
    // numerator = principal * r * pow
    // scale: principal_scale * r_scale * pow_scale
    const numerator = principal * r * powValue;
    const numeratorScale =
        10n ** BigInt(principalDecimals) * 10n ** BigInt(rDecimals) * powScale;
    // denominator = pow - 1
    const denominator = powValue - fixedScale;
    // denominator inherits pow's scale
    const denominatorScale = powScale;
    // emi = (numerator * INTERNAL_SCALE) / denominator
    const emiNumerator = numerator * fixedScale;
    const emi = emiNumerator / denominator;
    // Final scale: numerator_scale * INTERNAL_SCALE / denominator_scale
    const finalScale = (numeratorScale * fixedScale) / denominatorScale;
    return {
        emi,
        descaleFactor: finalScale,
    };
}
