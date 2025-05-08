type RemoteConfig = {
    key: string;
    value: string | URL;
}

export const RemoteConfigs: RemoteConfig[] = [
    {
        key: "最小配置", 
        value: "__DEFAULT"
    },
    {
        key: "ACL_默认版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"
    },
    {
        key: "ACL_无测速版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoAuto.ini"
    },
    {
        key: "ACL_去广告版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_AdblockPlus.ini"
    },
    {
        key: "ACL_多国家版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_MultiCountry.ini"
    },
    {
        key: "ACL_无Reject版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoReject.ini"
    },
    {
        key: "ACL_无测速精简版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_NoAuto.ini"
    },
    {
        key: "ACL_全分组版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini"
    },
    {
        key: "ACL_全分组谷歌版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Google.ini"
    },
    {
        key: "ACL_全分组多模式版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"
    },
    {
        key: "ACL_全分组奈飞版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Netflix.ini"
    },
    {
        key: "ACL_精简版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini.ini"
    },
    {
        key: "ACL_去广告精简版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_AdblockPlus.ini"
    },
    {
        key: "ACL_Fallback精简版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_Fallback.ini"
    },
    {
        key: "ACL_多国家精简版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiCountry.ini"
    },
    {
        key: "ACL_多模式精简版",
        value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiMode.ini"
    }
];
