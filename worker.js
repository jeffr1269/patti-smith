/**
 * Patti Smith — member Worker (Cloudflare Workers with Static Assets)
 *
 * Maps each incoming hostname to a subdirectory under /public, then serves the
 * matching static asset. One Worker serves the member's whole network; add a
 * site by dropping its files into a new /public subdirectory and wiring it into
 * HOST_MAP below (and adding its route in wrangler.jsonc once the domain is Active).
 *
 * Requires in wrangler.jsonc: assets.run_worker_first = true, binding = "ASSETS",
 * html_handling = "none", not_found_handling = "none".
 */

const HOST_MAP = {
  // Authority Center hub
  "pattismithrealtor.com": "PattiSmithRealtor.com",

  // Area authority sites — subdirectory names match the actual repo folders (domain-named)
  "pattismithgeorgetowncalifornia.com": "pattismithgeorgetowncalifornia.com",
  "pattismithgardenvalleycalifornia.com": "pattismithgardenvalleycalifornia.com",
  "pattismithcoolcalifornia.com": "pattismithcoolcalifornia.com",
  "pattismithplacervillecalifornia.com": "pattismithplacervillecalifornia.com",
  "pattismithpilothillcalifornia.com": "pattismithpilothillcalifornia.com",
  "pattismitheldoradocountyca.com": "pattismitheldoradocountyca.com",

  // Book sites — subdirectory names match the actual repo folders
  "pattismithnavigatingeldoradocountyrealestate.com": "TurbulenceBook",
  "pattismithyoureldoradocountyrealestateconsultant.com": "BizCardBook",
  "pattismithbuyingyoureldoradocountyhome.com": "NowNotLaterBook",
  "pattismithsellingyoureldoradocountyhome.com": "HiddenCostsBook",
  "pattismitheldoradocountyprobate.com": "book-probate",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Normalize host: drop a leading "www." so both forms resolve.
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const subdir = HOST_MAP[host];
    if (!subdir) {
      return new Response("Not found", { status: 404 });
    }

    // Map the request path into the host's subdirectory.
    // "/" (and any path ending in "/") resolves to that directory's index.html.
    let path = url.pathname;
    if (path === "" || path.endsWith("/")) {
      path += "index.html";
    }

    const assetUrl = new URL(url.toString());
    assetUrl.pathname = `/${subdir}${path}`;

    const assetRequest = new Request(assetUrl.toString(), request);
    return env.ASSETS.fetch(assetRequest);
  },
};
