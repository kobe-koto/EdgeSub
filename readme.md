# Edge Sub

在 CloudFlare 的全球網絡上轉換您的節點訂閱.

## 使用方式

> todo: how to use

去看原始碼會比較好

## 支援性表格

- 節點類型

  | 類型         | 支援 | 已經測試 | Notes        |
  | ------------ | ---- | -------- | ------------ |
  | HTTP         | ✅    | 🚫        |              |
  | Socks 5      | ✅    | 🚫        |              |
  | Hysteria 1   | ✅    | ✅        |              |
  | Hysteria 2   | ✅    | ✅        |              |
  | TUIC v5      | ✅    | ✅        |              |
  | Vmess        | ✅    | ☑️        | 未經完全測試 |
  | Vless        | ✅    | ☑️        | 未經完全測試 |
  | Shadowsocks  | 🚫    | -        |              |
  | ShadowsocksR | 🚫    | -        | 暫無計劃實現 |

- 訂閱類型

  | 類型                    | 輸入 | 輸出 | 輸出 Endpoint     | Notes                     |
  | ----------------------- | ---- | ---- | ----------------- | ------------------------- |
  | 內部除錯用格式          | 🚫    | ✅    | `/sub/debug`      |                           |
  | ShareLink 集合          | ✅    | 🚫    | -                 |                           |
  | ShareLink 集合 (Base64) | ✅    | 🚫    | -                 |                           |
  | Clash Meta 配置         | 🚫    | ✅    | `/sub/clash-meta` |                           |
  | Clash 配置              | 🚫    | 🚫    | -                 | 暫無計劃實現              |
  | Sing-Box 配置           | 🚫    | 🚫    | -                 | ~~世界很可愛 請給世界錢~~ |

  

