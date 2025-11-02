type TickSizeStep = {
    tick_size: number;
    above_price: number;
};

export type Instrument = {
    price_index: string;
    kind: string;
    instrument_name: string;
    maker_commission: number;
    taker_commission: number;
    instrument_type: string;
    expiration_timestamp: number;
    creation_timestamp: number;
    is_active: boolean;
    option_type: 'call' | 'put';
    contract_size: number;
    tick_size: number;
    strike: number;
    instrument_id: number;
    min_trade_amount: number;
    block_trade_commission: number;
    block_trade_min_trade_amount: number;
    block_trade_tick_size: number;
    settlement_currency: string;
    settlement_period: string;
    base_currency: string;
    counter_currency: string;
    quote_currency: string;
    tick_size_steps: TickSizeStep[];
};

export type ParsedInstrument = {
    parsed: {
        token: string;
        expiry: Date;
        strike: number;
    };
};
