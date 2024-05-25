# Edge Sub

在 CloudFlare 的全球網絡上轉換您的節點訂閱.

## 使用方式

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

  | 類型                    | 輸入 | 輸出 | 輸出 Endpoint     | Notes                     |
  | ----------------------- | ---- | ---- | ----------------- | ------------------------- |
  | 內部除錯用格式          | 🚫    | ✅    | `/sub/debug`      |                           |
  | ShareLink 集合          | ✅    | 🚫    | -                 |                           |
  | ShareLink 集合 (Base64) | ✅    | 🚫    | -                 |                           |
  | Clash Meta 配置         | 🚫    | ✅    | `/sub/clash-meta` |                           |
  | Clash 配置              | 🚫    | 🚫    | -                 | 暫無計劃實現              |
  | Sing-Box 配置           | 🚫    | 🚫    | -                 | ~~世界很可愛 請給世界錢~~ |

  

