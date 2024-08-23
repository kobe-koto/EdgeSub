# Edge Sub

在 CloudFlare 的全球網絡上轉換您的節點訂閱.

## 使用方式

- ### UI
  
  在 Cloudflare Pages 部署後打開，並按提示操作。

- ### Clash Meta

  Endpoint: `/sub/clash-meta`

  需要以下參數:

  - `url`: 輸入的訂閱的遠程位址
  - `remote_config` (可選): 遠端設定位址 (INI 格式), 默認為 https://raw.githubusercontent.com/kobe-koto/EdgeSub/main/assets/minimal_remote_conf/basic.ini
  - `udp` (可選): 遠端設定位址, 默認為 true
  - `forced_refresh` (可選): 是否強制刷新已緩存的遠端設定, 默認為 false

- ### Debug

  > **⚠️ Warning**
  > 
  > 該格式隨時可能發生變更, 僅供測試用途

  Endpoint: `/sub/debug`

  需要以下參數:

  - `url`: 輸入的訂閱的遠程位址

## 部署

- ### 在 Cloudflare Pages 上部署

  0. Fork 本項目
  1. 打開 dash.cloudflare.com
  2. 轉到側邊欄上的 **Workers & Pages** (Overview) 部分
  3. 按下 **Create** 按鈕
  4. 切換到 **Pages** 欄
  5. 按 **Connect to Git**
  6. 選擇你剛 Fork 下來的 EdgeSub 項目
  7. 在 **Build settings > Framework preset** 中選擇 Astro
  8. 編輯 **Build settings > Build command** 為 `pnpm build:frontend`
  9. 按下 **Save and Deploy**
  10. 部署完成後，你可能需要添加自訂網域，請前往 **項目 > Custom domains** 添加
  
  #### ✡️ 可選 - 為遠端規則添加緩存以加快處理速度:
  
  **需要注意的是，開發時會以假設緩存 KV 存在來開發，無緩存 KV 環境將作為低優先級來開發。**
  
  **因此，不添加緩存 KV 是不被推薦的行為。**
  
  1. 轉到 **Workers & Pages > KV**
  2. 按 **Create a namespacce**，**輸入任意名字**，然後按 **Add**
  3. 回到項目
  4. 轉到 **Settings > Functions >  KV namespace bindings**
  5. 按 **Add binding**
  6. 在 **Variable name** 填寫 `EdgeSubDB`，**KV namespace** 選擇你剛建立的 KV 空間
  7. 點按 **Save**
  8. 轉到**項目 > Deployments**
  9. 在 **All deployments** 中找到最近的一個 Deployment，然後點**右側三個點 > Retry Deployment**
  10. 完成


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
  
    目前暫無實現計劃, ~~因為我不會~~.

