import { defineConfig } from "astro/config";

// astro integrations
import compress from "astro-compress";
import icon from "astro-icon";

// vite plugins
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    prefetch: true,
    integrations: [
        compress(),
        icon(),
    ],
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern-compiler"
                }
            }
        },
        plugins: [
            tailwindcss(),
        ],
        // log dropping not enabled by default cuz this project will never be production ready lol
        // esbuild: {
        //     drop: ["console", "debugger"],
        // },
    },
});
