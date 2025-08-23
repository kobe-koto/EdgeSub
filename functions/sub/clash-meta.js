import { getClashMetaConfig } from "../internal/Converter/getClashMetaConfig.js";
import getParsedSubData from "../internal/getParsedSubData.ts";
import Yaml from "js-yaml";

export async function onRequest (context) {
  const { request } = context;
  const URLObject = new URL(request.url);

  let { Proxies, SubscriptionUserInfos } = await getParsedSubData(
    URLObject.searchParams.get("url"),
    context.env.EdgeSubDB,
    URLObject.searchParams.get("show_host") === "true",
    JSON.parse(URLObject.searchParams.get("http_headers")),
  );


  const removeNamesParam = URLObject.searchParams.get("remove_names");
  const removeRegexParam = URLObject.searchParams.get("remove_regex");

  let removeNames = [];
  if (removeNamesParam) {
    // treat remove_names as keywords (case-insensitive)
    removeNames = removeNamesParam
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.toLowerCase());
  }

  let removeRegex = null;
  if (removeRegexParam) {
    try {
      removeRegex = new RegExp(removeRegexParam);
    } catch (e) {
      return new Response(JSON.stringify({ error: "invalid remove_regex" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
  }

  // apply filtering to Proxies array
  let removedCount = 0;
  // remove_mode: exact | keyword | regex (default: keyword)
  const removeMode = (URLObject.searchParams.get("remove_mode") || "keyword").toLowerCase();
  if ((removeNames.length > 0 || removeRegex) && Array.isArray(Proxies)) {
    const beforeCount = Proxies.length;
    Proxies = Proxies.filter(p => {
      // normalize proxy to searchable strings
      let pname = "";
      let premark = "";

      if (typeof p === "string") {
        pname = p;
      } else if (p && typeof p === "object") {
        pname = p.name || p.Name || p.nick || p.alias || p.__Name || "";
        premark = p.remark || p.remarks || p.note || p.__Remark || "";
      }

      const combined = [pname, premark].filter(Boolean).join(" ").toLowerCase();

      // nothing to match against -> keep
      if (!combined) return true;

      // regex mode prefers removeRegex (falls back to testing pname+combined)
      if (removeMode === "regex") {
        if (removeRegex) {
          return !removeRegex.test(pname || combined);
        }
        // if no regex provided, nothing to remove in regex mode
        return true;
      }

      // exact mode: only exact name or remark match
      if (removeMode === "exact") {
        if (removeNames.length && removeNames.some(k => (pname && pname.toLowerCase() === k) || (premark && premark.toLowerCase() === k))) return false;
        if (removeRegex && ( (pname && removeRegex.test(pname)) || (premark && removeRegex.test(premark)) )) return false;
        return true;
      }

      // default: keyword mode (any keyword contained in name or remark)
      if (removeNames.length && removeNames.some(k => combined.includes(k))) return false;
      if (removeRegex && ( (pname && removeRegex.test(pname)) || (premark && removeRegex.test(premark)) )) return false;
      return true;
    });
    removedCount = beforeCount - Proxies.length;
  }

  let ClashMetaConfigObject = await getClashMetaConfig(
    Proxies,
    context.env.EdgeSubDB,
    {
      isUDP: URLObject.searchParams.get("udp") === "true",
      isSSUoT: URLObject.searchParams.get("ss_uot") === "true",
      isInsecure: true,
      RuleProvider: URLObject.searchParams.get("remote_config") || "__DEFAULT",
      RuleProvidersProxy: URLObject.searchParams.get("rule_providers_proxy"),
      isForcedRefresh: URLObject.searchParams.get("forced_refresh") === "true",
    }
  );

  // handle forced ws 0-rtt
  if (URLObject.searchParams.get("forced_ws0rtt") === "true") {
    console.info("[Main] ForcedWS0RTT enabled.")
    for (let i of ClashMetaConfigObject.proxies) {
      if (!("ws-opts" in i)) { continue; }
      i["ws-opts"]["max-early-data"] = 2560
      i["ws-opts"]["early-data-header-name"] = "Sec-WebSocket-Protocol"
    }
  }



  const ResponseBody = Yaml.dump(ClashMetaConfigObject);

  const response = new Response(
    ResponseBody,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": String(ResponseBody.length),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    }
  )

  if (SubscriptionUserInfos.length > 0) {
    let Names = SubscriptionUserInfos.map(i => i.name).filter(i => !!i); // two name, then eclipse...
    let NamesLimit = Names.length > 2 ? 2 : Names.length;
    let Filename = `${Names.slice(0, NamesLimit).join(", ")}, and ${SubscriptionUserInfos.length - NamesLimit} more`;
    response.headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(Filename)}.yaml`);
    let Traffic = SubscriptionUserInfos.map(i => i.traffic).filter(i => !!i)[0]; // first element of SubscriptionUserInfos // if Names.length > 1, then we shouldn't use such per-profile specific traffic values.
    if (Names.length === 1) {
      response.headers.set("Subscription-UserInfo", Traffic);
    }
  }

  // if we removed proxies earlier, expose it as a header
  if (typeof removedCount !== 'undefined' && removedCount > 0) {
    response.headers.set("X-Removed-Count", String(removedCount));
  }

  return response;
}
