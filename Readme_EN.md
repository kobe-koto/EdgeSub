
# Edge Sub

Transform your node subscriptions on CloudFlare's global network.

## Usage

- ### UI
  
  Open after deploying on Cloudflare Pages and follow the instructions.

- ### Clash Meta

  Endpoint: `/sub/clash-meta`

  Required parameters:

  - `url`: Remote address of the input subscription
  - `remote_config` (optional): Remote configuration address (INI format), defaults to https://raw.githubusercontent.com/kobe-koto/EdgeSub/main/public/minimal_remote_rules.ini
  - `udp` (optional): Enable UDP support, defaults to true
  - `forced_refresh` (optional): Force refresh cached remote settings, defaults to false

- ### Debug

  > **⚠️ Warning**
  > 
  > This format may change at any time. For testing purposes only.

  Endpoint: `/sub/debug`

  Required parameters:

  - `url`: Remote address of the input subscription

## Deployment

- ### Deploying on Cloudflare Pages

  0. Fork this project
  1. Open dash.cloudflare.com
  2. Navigate to **Workers & Pages** (Overview) section in the sidebar
  3. Click **Create** button
  4. Switch to **Pages** tab
  5. Click **Connect to Git**
  6. Select your forked EdgeSub project
  7. In **Build settings > Framework preset**, select Astro
  8. Edit **Build settings > Build command** to `pnpm build:frontend`
  9. Click **Save and Deploy**
  10. After deployment, you may need to add a custom domain via **Project > Custom domains**

  #### ✡️ Optional - Add cache for remote rules to speed up processing:

  **Note:** Development assumes cache KV exists. Non-cache KV environments will be developed with lower priority.

  **Therefore, not adding cache KV is not recommended.**

  1. Go to **Workers & Pages > KV**
  2. Click **Create a namespace**, input any name, then click **Add**
  3. Return to your project
  4. Go to **Settings > Functions > KV namespace bindings**
  5. Click **Add binding**
  6. Set **Variable name** to `EdgeSubDB`, select your newly created KV namespace for **KV namespace**
  7. Click **Save**
  8. Go to **Project > Deployments**
  9. Find the most recent deployment in **All deployments**, then click **three dots > Retry Deployment**
  10. Complete

## Compatibility Table

- Node Types

  | Type         | Supported | Tested | Notes                                 |
  | ------------ | --------- | ------ | ------------------------------------- |
  | HTTP         | ✅        | 🚫     |                                       |
  | Socks 5      | ✅        | 🚫     |                                       |
  | Hysteria 1   | ✅        | ✅     |                                       |
  | Hysteria 2   | ✅        | ✅     |                                       |
  | TUIC v5      | ✅        | ✅     |                                       |
  | Vmess        | ✅        | ☑️     | Not fully tested                      |
  | Vless        | ✅        | ☑️     | Not fully tested                      |
  | Shadowsocks  | ✅        | ✅     | UDP over TCP enabled when SS UoT is globally enabled |
  | Trojan       | ✅        | ✅     |                                       |
  | WireGuard    | 🚫        | -      | No universal ShareLink format found   |
  | ShadowsocksR | 🚫        | -      | No implementation plans               |
  | SSH          | 🚫        | -      | No implementation plans               |

- Subscription Types

  | Type                    | Input | Output | Output Endpoint     |
  | ----------------------- | ----- | ------ | ------------------- |
  | Internal Debug Format   | 🚫    | ✅     | `/sub/debug`        |
  | ShareLink Collection    | ✅    | ✅     | `/sub/share-link`   |
  | ShareLink Collection (Base64) | ✅ | ✅  | `/sub/base64`       |
  | Clash Meta Configuration| ✅    | ✅     | `/sub/clash-meta`   |
  | Clash Configuration     | ✅    | ✅     | `/sub/clash`        |
  | Sing-Box Configuration  | ✅    | ✅     | `/sub/sing-box`     |

  Notes:
  
  - **Clash Meta & Clash Configurations**: 
  
    - Input: No special processing currently
    - Output: Clash configuration filtered to include only supported proxy types, otherwise identical to Clash Meta.
  
  - **Internal Debug Format**: 
  
    For debugging only. Subject to breaking changes or removal at any time in the future.
