import { BASE_URL, CRYPTO_COINS, CRYPTO_SYMBOLS, type CryptoSymbol } from "~/data/coins/all_coins";
import { CURRENCIES, CURRENCY_DATA, type Currency } from "~/data/currencies";
import { type ConversionInputs, DEFAULT_ROOT_SYMBOL } from ".";

export function syncFavicon(symbol: CryptoSymbol | Currency) {
    const existing = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    const link = existing || document.createElement('link') as HTMLLinkElement;
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = getLogo(symbol) + `?v=${Math.random()}`; //bust browser cache
  
    if (!existing) { 
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }
  
  export function syncQueryParams(inputs: Partial<ConversionInputs>) { 
    const url = new URL(window.location.href);
    if (inputs.from) { 
      url.searchParams.set("from", inputs.from)
    }
    if (inputs.to) {
      url.searchParams.set("to", inputs.to)
    }
    if (inputs.amount) {
      url.searchParams.set("amount", inputs.amount.toString())
    }
    window.history.replaceState({}, "", url.toString())
  }
  
  export function getLogo(symbol: string) {
    if (CURRENCIES.includes(symbol as Currency)) {
      return CURRENCY_DATA[symbol as Currency].logo_link
    } else if (CRYPTO_SYMBOLS.includes(symbol as CryptoSymbol)) {
      return BASE_URL + CRYPTO_COINS[symbol as CryptoSymbol].logo
    }
    return BASE_URL + CRYPTO_COINS[DEFAULT_ROOT_SYMBOL].logo
  }
  
  
  
  export function getTitle(from: string, to: string) {
    return `${from} to ${to} | Cryptocurrency Converter | Powered by InvestorsHub from ADVFN`
  }