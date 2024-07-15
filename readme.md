# Edge Sub

在 CloudFlare 的全球網絡上轉換您的節點訂閱.

## 使用方式

- ### UI
  
  在 Cloudflare Pages 部署後打開，並按提示操作。

- ### Clash Meta

  Endpoint: `/sub/clash-meta`

  需要以下參數:

  - `url`: 輸入的訂閱的遠程位址
  - `remote_config` (可選): 遠端設定位址, 默認為 https://raw.githubusercontent.com/kobe-koto/EdgeSub/main/assets/minimal_remote_conf/basic.ini
  - `forced_refresh` (可選): 是否強制刷新已緩存的遠端設定, 默認為 false

- ### Debug

  > **⚠️ Warning**
  > 
  > 該格式隨時可能發生變更, 僅供測試用途

  Endpoint: `/sub/debug`

  需要以下參數:

  - `url`: 輸入的訂閱的遠程位址


## 相容性表格

- 節點類型

  | 類型         | 支援 | 已經測試 | Notes                                 |
  | ------------ | ---- | -------- | ------------------------------------- |
  | HTTP         | ✅    | 🚫        |                                       |
  | Socks 5      | ✅    | 🚫        |                                       |
  | Hysteria 1   | ✅    | ✅        |                                       |
  | Hysteria 2   | ✅    | ✅        |                                       |
  | TUIC v5      | ✅    | ✅        |                                       |
  | Vmess        | ✅    | ☑️        | 未經完全測試                          |
  | Vless        | ✅    | ☑️        | 未經完全測試                          |
  | Shadowsocks  | ✅    | ✅        | 全局設定為開啓 UDP 时會開啓 UDP over TCP |
  | Trojan       | ✅    | ✅        |                                    |
  | WireGuard    | 🚫    | -        | 似乎沒有通用的 ShareLink 格式         |
  | ShadowsocksR | 🚫    | -        | 暫無計劃實現                          |
  | SSH          | 🚫    | -        | 暫無計劃實現                          |

- 訂閱類型

  | 類型                    | 輸入 | 輸出 | 輸出 Endpoint     |
  | ----------------------- | ---- | ---- | ----------------- |
  | 內部除錯用格式          | 🚫    | ✅    | `/sub/debug`      |
  | ShareLink 集合          | ✅    | ✅    | `/sub/share-link` |
  | ShareLink 集合 (Base64) | ✅    | ✅    | `/sub/base64`     |
  | Clash Meta 配置         | ✅    | ✅    | `/sub/clash-meta` |
  | Clash 配置              | ✅    | ✅    | `/sub/clash`      |
  | Sing-Box 配置           | 🚫    | 🚫    | -                 |

  Notes:
  
  - **Clash Meta 和 Clash 配置**: 
  
    - 輸入: 目前不做任何特殊處理
    - 輸出: Clash 配置的輸出經過濾以保證只含有已被支援的 Proxy 類型, 其餘與 Clash Meta 無異.
  
  - **內部除錯用格式**: 
  
    僅供除錯, 將會在未來的任意某個時間點做出破壞性改動或刪除.
  
  - **Sing-Box 配置**: 
  
    ~~世界很可愛, 請給世界錢~~. 
  
    目前暫無實現計劃, ~~因為我不會~~.

