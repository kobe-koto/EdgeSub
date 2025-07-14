# Edge Sub

在 CloudFlare 的全球網絡上轉換您的代理訂閱.

請為我點一個 ⭐ Star!

## 使用方式

- ### UI
  
  在 Cloudflare Pages 部署後打開，並按提示操作。

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
  | HTTP         | 🗿  | 🚫        | 由於與 **遠端訂閱** 不相容, 請勿直接傳入 HTTP Proxy |
  | Socks 5      | ✅    | 🚫        |                                       |
  | Hysteria 1   | ✅    | ✅        |                                       |
  | Hysteria 2   | ✅    | ✅        |                                       |
  | TUIC v5      | ✅    | ✅        |                                       |
  | Vmess        | ✅    | ☑️        | 未經完全測試                          |
  | Vless        | ✅    | ☑️        | 未經完全測試                          |
  | Shadowsocks  | ✅    | ✅        |  |
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
  | Sing-Box 配置           | ✅    | ✅    | `/sub/sing-box`   |

  Notes:
  
  - Legacy Clash config support has been dropped at `Commit 13df326`
  
  - **內部除錯用格式**: 
  
    僅供除錯, 將會在未來的任意某個時間點做出破壞性改動或刪除.

## Handling Traffic and Name Information

**Note: This section's behavior description applies specifically to Clash Meta Config.**

This section describes how `traffic` and `name` information is processed from incoming data.

1.  **Data Parsing:**
    The `decodeURIComponent`-decoded URL (or "subdata") is parsed line by line. Each non-empty and valid line is treated as either a `Subscription` or a `Proxy`.
    
    *   A `Subscription` object may contain a `SubscriptionUserInfo` attribute.
    *   A `Proxy` object does not contain `SubscriptionUserInfo`.
    *   The `SubscriptionUserInfo` attribute, if present, contains `traffic` and `name` fields. Both `traffic` and `name` can be empty or absent within `SubscriptionUserInfo`.
    
2.  **Name Processing and Display:**
    Names that are extracted and considered "visible" (i.e., non-empty) are aggregated for display. If multiple visible names exist, they will be presented in a summarized format, for example: `Name1, Name2, and <N> more` (where `<N>` represents the count of additional subscriptions and proxies with visible names).

    *Note: A `name` might not be explicitly present or might be empty within a `SubscriptionUserInfo` object, even if `SubscriptionUserInfo` itself exists.*

3.  **Traffic Data Handling:**
    Traffic data is processed based on the number of unique "visible" names found:
    
    *   If only **one** visible `name` is identified across all parsed Subscriptions and Proxies, the first available `traffic` value will be displayed or passed through. The **order in which the lines are parsed** determines which `traffic` value is considered "first."
    *   If **more than one** visible `name` is identified, traffic data will be ignored.

## Subscription Requesting

When requesting subscriptions based on user-provided data, the following HTTP headers are used:

1.  **Default HTTP Headers:**
    The application sends a set of default HTTP headers, as defined in `/functions/internal/configs.ts`. These include:
    
    ```json
    {
        "Accept": "*/*",
        "User-Agent": "EdgeSub-git/0.0.0 (Prefer ClashMeta / Mihomo Format)"
    }
    ```
    
2.  **User-Provided HTTP Headers:**
    Users can provide additional HTTP headers. The processing of these headers is as follows:
    
    *   Any non-empty and valid user-provided header that shares a key with a default HTTP header will **overwrite** the corresponding default header.
    *   Any non-conflicting user-provided headers (i.e., those with unique keys not present in the default set) will be **appended** to the request.

## Shorter Feature Security Overview

Shorts data is **stored remotely** is **unencrypted**.

*   Each short is uniquely identified by a **Short ID**.
*   **Short IDs** provide **read-only access** to a specific short.
*   A corresponding **Short Token** grants **write access** to a specific short. These tokens are for access control only and are **not encryption keys**.

The **Shorter Admin Password** allows viewing all Short IDs. If this password is forgotten, you will need to delete the "admin-password" key in the KV database and then setting a new one.
