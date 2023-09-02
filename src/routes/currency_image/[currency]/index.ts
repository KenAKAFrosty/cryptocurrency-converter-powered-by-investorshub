import { type RequestHandler } from "@builder.io/qwik-city";
import { CRYPTO_SYMBOLS, type CryptoSymbol } from "~/data/coins/all_coins";
import { CURRENCIES, type Currency } from "~/data/currencies";
import { getLogo } from "~/routes/metadata-helpers";

export const onGet: RequestHandler = (event) => {
    console.log(event.params);
    const currency = event.params.currency;
    if (CRYPTO_SYMBOLS.includes(currency as CryptoSymbol) || CURRENCIES.includes(currency as Currency)) {
        const endpoint = getLogo(currency);
        throw event.redirect(302, endpoint);
    }
}