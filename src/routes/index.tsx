import { type NoSerialize, component$, noSerialize, useSignal, useStylesScoped$, useTask$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { type CryptoSymbol } from "~/data/coins/all_coins";
import { type Currency } from "~/data/currencies";
import { getCryptoConversion, getHrefFromLink } from "./api-helpers";
import { syncFavicon, syncQueryParams, getLogo, getTitle } from "./metadata-helpers";
import { LinkIcon, ShareIcon } from "~/components/hero-icons";

export const DEFAULT_ROOT_SYMBOL: CryptoSymbol = "BTC";
export const DEFAULT_TARGET_SYMBOL: CryptoSymbol | Currency = "USD";

export const POPULAR_CHOICES: (CryptoSymbol | Currency)[] = [
  "BTC",
  "ETH",
  "LTC",
  "SATOSHI",
  "GBP",
  "USD",
  "EUR",
  "JPY",
  "BRL"
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
      width: 400px;
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
      font-size: 32px;
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
      font-size: 20px;
      text-align: center;
      width: 120px;
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
    }
    .currency p { 
      font-size: 24px;
    }
  `);



  const conversionInputs = useSignal(useConversionInputs().value);
  const conversion = useSignal(useLoadedConversion().value);
  // const isLoading = useSignal(false);

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


  const clickedShare = useSignal(false);
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

        {conversion.value.amount === 0 && <p>Cannot convert between these two.</p>}
        <div class="flex-row currencies">
          <div class="currency">
            <div class="flex-row">
              <h2>{conversion.value.from.currency}</h2>
              <a target="_blank" href={getHrefFromLink(conversion.value.from_coin_link)}>
                <LinkIcon />
              </a>
            </div>
            <input bind:value={fromInput} />
          </div>
          <div class="currency">
            <div class="flex-row">
              <h2>{conversion.value.to.currency}</h2>
              {conversion.value.to_coin_link && <a target="_blank" href={getHrefFromLink(conversion.value.to_coin_link)}>
                <LinkIcon />
              </a>}
            </div>
            <input bind:value={toInput} />
          </div>
        </div>

        <div class={{
          "flex-row": true,
          // "bloading": isLoading.value,
          "chart": true
        }}>
          {conversion.value.chart.link && conversion.value.chart.image && <>
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
    ],
  };
}
