import { type NoSerialize, component$, noSerialize, useSignal, useStylesScoped$, useTask$, useComputed$, $, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead, server$ } from "@builder.io/qwik-city";
import { CRYPTO_COINS, CRYPTO_SYMBOLS, type CryptoSymbol } from "~/data/coins/all_coins";
import { CURRENCIES, CURRENCY_DATA, type Currency } from "~/data/currencies";
import { getCryptoConversion, getHrefFromLink } from "./api-helpers";
import { syncFavicon, syncQueryParams, getLogo, getTitle } from "./metadata-helpers";
import { LinkIcon, ShareIcon } from "~/components/hero-icons";

export const DEFAULT_ROOT_SYMBOL: CryptoSymbol = "BTC";
export const DEFAULT_TARGET_SYMBOL: CryptoSymbol | Currency = "USD";

export const POPULAR_CHOICES: (CryptoSymbol | Currency)[] = [
  "BTC",
  "ETH",
  "LTC",
  "GBP",
  "USD",
  "EUR",
  "JPY",
  "BRL",
  "SATOSHI",
]

export const useConversionInputs = routeLoader$(async (event) => {
  let from = event.query.get("from") || DEFAULT_ROOT_SYMBOL;
  from = from.toUpperCase();
  let to = event.query.get("to") || DEFAULT_TARGET_SYMBOL;
  to = to.toUpperCase();
  const amount = event.query.get("amount") || 1;
  return {
    from: from as CryptoSymbol | Currency,
    to: to as CryptoSymbol | Currency,
    amount
  };
});
export type ConversionInputs = ReturnType<typeof useConversionInputs>["value"];

export const useLoadedConversion = routeLoader$(async (event) => {
  const inputs = await event.resolveValue(useConversionInputs);
  return getCryptoConversion.call(event, inputs);
});

export default component$(() => {


  useStylesScoped$(`
    section { 
      text-align: center;
      min-width: 540px;
      width: fit-content;
      background: #fafafa;
      border-radius: 8px;
      padding: 8px;
      position: relative;
      box-shadow: 0 0 8px rgba(0,0,0,0.2);
      padding-top: 16px;
    }
    h1 { 
      margin: 8px;
    }
    h2 { 
      margin: 4px;
      font-size: 48px;
    }
    main { 
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    a { 
      display: flex;
      align-items: center;
    }
    a:visited { 
      color: #inherit;
    }
    input { 
      font-size: 22px;
      text-align: center;
      min-width: 120px;
      max-width: 180px;
      width: 100%;
    }
    .share { 
      position: absolute;
      color: #a841fa;
      top: 10px;
      right: 10px;
      font-size: 12px;
      cursor: pointer;
    }
    .powered-by { 
      margin-top: 8px;
      cursor: pointer;
    }
    .flex-row { 
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chart { 
      min-height: 40px;
    }
    .chart a { 
      text-decoration: none;
      gap: 4px;
    }
    .chart img { 
      border: 0.5px solid #8202fa;
      border-radius: 4px;
      overflow: hidden;
    }
    .chart button { 
      font-weight: bold;
      font-size: 19px;
      font-family: inherit;
      border: none;
      background: none;
      cursor: pointer;
      padding: 4px 6px 8px;
      border-radius: 4px;
      color: white;
      background: linear-gradient(120deg, #a841fa 0%, #8202fa 100%);
    }
    .currency { 
      height: fit-content;
      background-color: white;
      padding: 6px;
      border-radius: 6px;
      margin: 4px;
      box-shadow: 0 0 7px rgba(0,0,0,0.1);
      min-width: 140px;
      min-height: 160px;
      position: relative;
    }
    .popular-choices { 
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .popular-choices button { 
      cursor: pointer;
      width: 70px;
    }
    input.currency-search { 
      font-size: 14px;
      min-width: 60px;
      width: 60px;
    }

    .currency .results { 
      z-index: 2;
      position: absolute;
      right: 0px;
      top: 24px;
      background: white;
      box-shadow: 0 0 8px rgba(0,0,0,0.2);
      max-height: 120px;
      overflow-y: auto;
    }
    .currency .results button { 
      cursor: pointer;
      border: none;
      background: none;
      display: block;
      padding: 8px 2px;
      margin: 4px;
      min-width: 190px;
      width: 92%;
      font-size: 14px;
      text-align: left;
    }
    .currency .results button:hover { 
      background: #fafafa;
      outline: 1px solid black;
    }
  `);



  const conversionInputs = useSignal(useConversionInputs().value);
  const conversion = useSignal(useLoadedConversion().value);
  const syncConversion = $(() => {
    getCryptoConversion({
      from: conversionInputs.value.from,
      to: conversionInputs.value.to,
      amount: conversionInputs.value.amount
    }).then(newConversion => conversion.value = newConversion)
  })

  useTask$(({ track }) => {
    track(() => conversionInputs.value);
    if (typeof (window) === "undefined") { return }
    window.document.title = getTitle(conversionInputs.value.from, conversionInputs.value.to)
    syncFavicon(conversionInputs.value.from);
    syncQueryParams(conversionInputs.value);
  })

  const fromInput = useSignal(conversion.value.amount.toString());
  const fromAbort = useSignal<NoSerialize<AbortController>>();
  const toInput = useSignal(conversion.value.conversion);
  const toAbort = useSignal<NoSerialize<AbortController>>();
  useTask$(({ track }) => {
    track(() => fromInput.value);
    if (fromInput.value === conversion.value.amount.toString()) { return }

    if (fromAbort.value) {
      fromAbort.value.abort();
    }

    conversionInputs.value = {
      ...conversionInputs.value,
      amount: fromInput.value
    }

    fromAbort.value = noSerialize(new AbortController());
    getCryptoConversion(fromAbort.value!.signal, {
      from: conversionInputs.value.from,
      to: conversionInputs.value.to,
      amount: fromInput.value
    }).then(newConversion => {
      conversion.value = newConversion;
    })
  });

  useTask$(({ track }) => {
    track(() => toInput.value);
    if (toInput.value === conversion.value.conversion) { return }
    if (toAbort.value) {
      toAbort.value.abort();
    }
    //inverse conversion
    toAbort.value = noSerialize(new AbortController());
    getCryptoConversion(toAbort.value!.signal, {
      from: conversionInputs.value.to,
      to: conversionInputs.value.from,
      amount: toInput.value
    }).then(reverseConversion => {

      conversionInputs.value = {
        ...conversionInputs.value,
        amount: reverseConversion.conversion_unformatted
      }
      conversion.value = {
        amount: reverseConversion.conversion_unformatted,
        conversion: reverseConversion.amount.toString(),
        unit: reverseConversion.amount,
        conversion_unformatted: reverseConversion.amount,
        status: reverseConversion.status,
        from: conversion.value.from,
        to: conversion.value.to,
        chart: conversion.value.chart,
        from_coin_link: conversion.value.from_coin_link,
        to_coin_link: conversion.value.to_coin_link,
      }
    })
  })


  useTask$(({ track }) => {
    track(() => conversion.value);
    if (toInput.value !== conversion.value.conversion) {
      toInput.value = conversion.value.conversion;
    }
    if (fromInput.value !== conversion.value.amount.toString()) {
      fromInput.value = conversion.value.amount.toString();
    }
  });

  console.log(conversion.value);

  const clickedShare = useSignal(false);
  const invalidConversion = useComputed$(() => conversion.value.amount === 0);


  const fromSearch = useSignal("");
  const fromResults = useSignal<Array<{symbol: string, name: string}>>([]);

  const toSearch = useSignal("");
  const toResults = useSignal<Array<{symbol: string, name: string}>>([]);

  useVisibleTask$(({track})=> { 
    track(()=> fromSearch.value);
    if (fromSearch.value === "") { return }
    autoCompleteCurrency(fromSearch.value).then(results => {
      fromResults.value = results;
    });
  });

  useVisibleTask$(({track})=> {
    track(()=> toSearch.value);
    if (toSearch.value === "") { return }
    autoCompleteCurrency(toSearch.value).then(results => {
      toResults.value = results;
    });
  });

  const areSame = useComputed$(()=> { 
    return conversionInputs.value.from === conversionInputs.value.to;
  })
  return (
    <section>
      {<div class="share flex-row" onClick$={() => {
        clickedShare.value = true;
        navigator.clipboard.writeText(window.location.href);
        setTimeout(() => {
          clickedShare.value = false;
        }, 3000);
      }}>
        {clickedShare.value === true ? 'Link copied to clipboard!' : <>Share <ShareIcon /></>}
      </div>}
      <h1>Cryptocurrency Converter</h1>
      <main>

        {invalidConversion.value === true && <p>Cannot convert between these two.</p>}
        <div class="flex-row currencies">
          <div class="popular-choices from">
            {POPULAR_CHOICES.map((choice) => {
              return <button onClick$={() => {
                conversionInputs.value = {
                  ...conversionInputs.value,
                  from: choice
                }
                syncConversion();
              }} key={choice}
              >
                {choice}
              </button>
            })}
          </div>

          <div class="currency">
            <div class="flex-row">
              <img height={40} width={40} src={`/currency_image/${conversion.value.from.currency}`} />
              <h2>{conversion.value.from.currency}</h2>
              {invalidConversion.value === false && <a target="_blank" href={getHrefFromLink(conversion.value.from_coin_link)}>
                <LinkIcon />
              </a>}
            </div>
            <input style={{marginLeft: "auto"}} bind:value={fromInput} />
            <div class="flex-row" style={{marginTop: "20px", position: "relative"}}>
              <span style={{flexGrow: 1, textAlign: "right"}}>Search 🔎</span>
              <input class="currency-search" bind:value={fromSearch} />
              <div class="results">
                {fromResults.value.map(result => {
                  return <button key={result.symbol} onClick$={()=> { 
                    conversionInputs.value = {
                      ...conversionInputs.value,
                      from: result.symbol as CryptoSymbol | Currency
                    }
                    fromSearch.value = "";
                    fromResults.value = [];
                    syncConversion();
                  }}>
                    ({result.symbol}) {result.name}
                  </button>
                })}
              </div>
            </div>
          </div>


          <div class="currency">
            <div class="flex-row">
              <img height={40} width={40} src={`/currency_image/${conversion.value.to.currency}`} />
              <h2>{conversion.value.to.currency}</h2>
              {conversion.value.to_coin_link && invalidConversion.value === false &&
                <a target="_blank" href={getHrefFromLink(conversion.value.to_coin_link)}>
                  <LinkIcon />
                </a>}
            </div>
            <input bind:value={toInput} />
            <div class="flex-row" style={{marginTop: "20px",  position: "relative"}}>
              <span style={{flexGrow: 1, textAlign: "right"}}>Search 🔎</span>
              <input class="currency-search" bind:value={toSearch} />
              <div class="results">
                {toResults.value.map(result => {
                  return <button key={result.symbol} onClick$={()=> { 
                    conversionInputs.value = {
                      ...conversionInputs.value,
                      to: result.symbol as CryptoSymbol | Currency
                    }
                    toSearch.value = "";
                    toResults.value = [];
                    syncConversion();
                  }}>
                    ({result.symbol}) {result.name}
                  </button>
                })}
              </div>
            </div>
          </div>

          <div class="popular-choices to">
            <div class="popular-choices">
              {POPULAR_CHOICES.map((choice) => {
                return <button onClick$={() => {
                  conversionInputs.value = {
                    ...conversionInputs.value,
                    to: choice
                  }
                  syncConversion();
                }} key={choice}
                >
                  {choice}
                </button>
              })}
            </div>
          </div>
        </div>

        <div class={{
          "flex-row": true,
          "chart": true
        }}>
          {areSame.value === false && conversion.value.chart.link && conversion.value.chart.image && <>
            <a target="_blank" href={conversion.value.chart.link}>
              <img width="60" height="40" src={conversion.value.chart.image} />
              <button>Expand chart</button>
            </a>
          </>}
        </div>
        <div class="flex-row powered-by">
          <a target="_blank" href={conversion.value.chart.link || conversion.value.from_coin_link || "https://investorshub.com"}>
            Powered by
            <img width="120" height="30" src="https://investorshub.advfn.com/images/ihub-master-logo.png" alt="InvestorsHub from ADVFN" />
          </a>
        </div>
      </main>
    </section>
  );
});


export const autoCompleteCurrency = server$(async function (term: string) {
  const currencyMatches = CURRENCIES.filter((symbol) => symbol.toLowerCase().startsWith(term.toLowerCase()));
  const cryptoMatches = CRYPTO_SYMBOLS.filter((symbol) => symbol.toLowerCase().startsWith(term.toLowerCase()));
  return [
    ...currencyMatches.map(currency => ({ symbol: currency, name: CURRENCY_DATA[currency].name })),
    ...cryptoMatches.map(crypto => ({ symbol: crypto, name: CRYPTO_COINS[crypto].name }))
  ]
});


export const head: DocumentHead = (context) => {
  const { from, to } = context.resolveValue(useConversionInputs);

  return {
    title: getTitle(from, to),
    links: [
      { rel: "icon", type: "image/png", href: getLogo(from) },

    ],
    meta: [
      {
        name: "description",
        content: getTitle(from, to),
      },
      { 
        name: "image",
        content: getLogo(from)
      }
    ],
  };
}
