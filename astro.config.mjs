import { defineConfig } from "astro/config";
import fs from "node:fs";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import icon from "astro-icon";
const {
    homepage: domain
} = JSON.parse(fs.readFileSync("./package.json"));


export default defineConfig({
    site: domain,
    prefetch: true,
    integrations: [
        sitemap({
            filter: page => (
                page !== `${domain}/404.html` && 
                page !== `${domain}/404/` && 
                page !== `${domain}/404`
            )
        }),
        compress({
            HTML: {
                collapseWhitespace: true,
                conservativeCollapse: true
            }
        }),
        icon()
    ],
    vite: {
        esbuild: {
            drop: ["console", "debugger"],
        },
    },
});
