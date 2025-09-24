import { MetaToSingRuleMapping } from "./MetaToSingMapping";
const itemRegex = /\((.*?)\)/g;

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
export function MetaToSingLogicalRule (type: string, payload: string) {
    // console.log(payload)
    const payloads = payload.replace(/(^\(|\)$)/g, "");
    // console.log(payloads)
    const rules = parseParenthesizedItems(payloads).map(i => {
        const itemBreakdown = i.split(",");
        const itemType = MetaToSingRuleMapping[itemBreakdown[0]];
        const itemPayload = itemBreakdown[1];
        if (itemType === "and" || itemType === "or") {
            return MetaToSingLogicalRule(itemType, itemBreakdown.slice(1).join(","))
        }
        return {
            [itemType]: itemPayload,
        }
    });
    
    return {
        type: "logical",
        mode: type,
        rules: rules
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