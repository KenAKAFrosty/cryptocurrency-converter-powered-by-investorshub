import { server$ } from "@builder.io/qwik-city"
import { type ConversionInputs } from "."

type CryptoConversion = {
    status: "Success",
    from_coin_link: string,
    to_coin_link: string | null,
    amount: number,
    conversion_unformatted: number,
    conversion: string,
    unit: number,
    chart: {
        text: string,
        image: string,
        link: string
    },
    from: {
        currency: string
    },
    to: {
        currency: string
    }
}
export async function _getCryptoConversion(inputs: ConversionInputs) {
    const endpoint = new URL("https://ih.advfn.com/common/cryptocurrency/converter/api/getConversion");
    endpoint.searchParams.append("from", inputs.from);
    endpoint.searchParams.append("to", inputs.to);
    endpoint.searchParams.append("amount", inputs.amount.toString());
    return fetch(endpoint.toString()).then(res => res.json()) as Promise<CryptoConversion>
}
export const getCryptoConversion = server$(_getCryptoConversion)


export function getHrefFromLink(link: string) {
    if (!link) { return link }
    return "https://" + link.split('<a href="//')[1].split('"')[0]
}

type AllCoins = {
    status: "success",
    cryptos: Array<{
        symbol: string,
        name: string,
        logo: string
    }>
}

export async function _getAllCoins() {
    return fetch("https://ih.advfn.com/common/crypto/api/getAllCoins").then(res => res.json()) as Promise<AllCoins>
}
export const getAllCoins = server$(_getAllCoins)