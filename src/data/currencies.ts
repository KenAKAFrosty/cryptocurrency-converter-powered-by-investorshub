export const CURRENCY_DATA = {
    USD: {
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_USD.png",
        name: "US Dollar"
    },
    GBP: {
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_GBP.png",
        name: "British Pound"
    },
    JPY: {
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_JPY.png",
        name: "Japanese Yen"
    },
    AUD: { 
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_AUD.png",
        name: "Australian Dollar"
    },
    CAD: { 
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_CAD.png",
        name: "Canadian Dollar"
    },
    MXN: { 
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_MXN.png",
        name: "Mexican Nuevo Peso"
    }, 
    PHP: { 
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_PHP.png",
        name: "Philippine Peso"
    },
    BRL: { 
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_BRL.png",
        name: "Brazilian Real"
    },
    EUR: {
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_EUR.png",
        name: "Euro"
    },
    SATOSHI: { 
        logo_link: "https://ih.advfn.com/cdn/crypto/logos/original/_SATOSHI.png",
        name: "Satoshi"
    }
} as const satisfies { [Key: string]: { logo_link: string, name: string } }

export type Currency = keyof typeof CURRENCY_DATA

export const CURRENCIES = Object.keys(CURRENCY_DATA) as Array<Currency>