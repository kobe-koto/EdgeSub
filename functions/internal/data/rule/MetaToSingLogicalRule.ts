import { MetaToSingRuleMapping } from "./MetaToSingMapping";
import { transformGeoRef } from "../ruleset/transformGeoRef";
import type { headlessRuleSet } from "../ruleset/transformGeoRef";

/**
 * Parse Mihomo Logical rules, AND | OR
 * example:
 *  - AND,  ((DOMAIN,baidu.com),(NETWORK,UDP))
 *  - OR,   ((NETWORK,UDP),(DOMAIN,baidu.com))
 * Nesting supported!
 * example:
 *  - AND,  ( (DOMAIN,baidu.com), (OR, ( (NETWORK,UDP), (PORT,443) ) ) )
 * @param type Sing rule type 
 * @returns Sing Headless rule
 */
export function MetaToSingLogicalRule (type: string, payload: string, EdgeSubInstanceBaseURL): { headlessRule: any, headlessRuleSet: headlessRuleSet[] } {
    // console.log(payload)
    const payloads = payload.replace(/(^\(|\)$)/g, "");
    // console.log(payloads)
    const ruleSets: headlessRuleSet[] = [];
    const rules = parseParenthesizedItems(payloads).map(i => {
        const itemBreakdown = i.split(",");
        const itemType = MetaToSingRuleMapping[itemBreakdown[0]];
        const itemPayload = itemBreakdown[1];
        // handle GEOIP and GEOSITE
        if (itemType === "geoip" || itemType === "geosite") {
            const { headlessRule, headlessRuleSet } = transformGeoRef(itemType, itemPayload, EdgeSubInstanceBaseURL);
            // if we cant find rule set with same tag (ie append before), 
            if (headlessRuleSet && !(ruleSets.find(i => i.tag === headlessRuleSet.tag))) { 
                ruleSets.push(headlessRuleSet);
            }
            return headlessRule;
        }
        if (itemType === "and" || itemType === "or") {
            let { 
                headlessRule: RecrusivlyHeadlessRule, 
                headlessRuleSet: RecrusivlyHeadlessRuleSet 
            } = MetaToSingLogicalRule(itemType, itemBreakdown.slice(1).join(","), EdgeSubInstanceBaseURL);

            RecrusivlyHeadlessRuleSet = RecrusivlyHeadlessRuleSet.filter(i => !!i && !ruleSets.find(t => t.tag === i.tag));
            ruleSets.push(...RecrusivlyHeadlessRuleSet);

            return RecrusivlyHeadlessRule;
        }
        return {
            [itemType]: itemPayload,
        }
    });
    
    return {
        headlessRule: {
            type: "logical",
            mode: type,
            rules: rules
        },
        headlessRuleSet: ruleSets
    }
}


/**
 * Parses a string containing comma-separated, parenthesized items into an array of strings.
 * This version correctly handles nested parentheses by manually balancing them,
 * which is a task simple regular expressions cannot reliably perform.
 *
 * @param inputString The string to parse, e.g., "(A,(B)),(C)".
 * @returns An array containing the inner content of each top-level parenthesized item.
 * For example, ["A,(B)", "C"].
 * Returns an empty array if there are no matches.
 */
function parseParenthesizedItems(inputString: string): string[] {
    const result: string[] = [];
    let parenCount = 0;
    let itemStart = -1;

    for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];

        if (char === '(') {
        if (parenCount === 0) {
            // This is the start of a top-level item.
            // Mark the position right after the opening parenthesis.
            itemStart = i + 1;
        }
        parenCount++;
        } else if (char === ')') {
        parenCount--;
        if (parenCount === 0 && itemStart !== -1) {
            // We've found the closing parenthesis of a top-level item.
            // Extract the content from itemStart to the current position.
            result.push(inputString.substring(itemStart, i));
            itemStart = -1; // Reset for the next item.
        }
        }
    }

    // A final check: if parenCount is not 0, the input string had mismatched parentheses.
    // You might want to throw an error here, but for now we'll return what we found.
    if (parenCount !== 0) {
        console.error("Warning: Mismatched parentheses in input string.");
    }

    return result;
}