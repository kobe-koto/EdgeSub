export async function fetchCached (URL, Prefix = "Cached", CacheDB, isForcedRefresh = false) {
    // const CacheKey = `RemoteConfig_${URL}`;
    const CacheKey = `${Prefix}_${URL}`;
    const CacheTTL =  6 * 60 * 60; // 6hrs for default

    // check if data was cached
    let CachedData;
    if (!CacheDB) {
        CachedData = null;
        console.info(`[fetchCached] - CacheDB is not configured, fetching.`)
    } else {
        if (isForcedRefresh) {
            CachedData = null;
        } else {
            CachedData = await CacheDB.get(CacheKey)
        }
    }

    // return cached data when it exist
    if (CachedData) {
        return CachedData;
    }

    console.info(`[fetchCached] - "${CacheKey}" is not cached, fetching.`)
    // only when CachedData == falsy
    let data = await fetch (URL)
        .then(res => {
            if (res.status === 200 || res.status === 304) {
                return res
            } else {
                throw "Failed to fetch."
            }
        })
        .then(res => res.text())
        .catch(() => false);
    // save it into CacheDB when success, and, whatever, when CacheDB exist.
    if (data !== false && CacheDB) {
        await CacheDB.put(CacheKey, data, { expirationTtl: CacheTTL })
    }
    // just return
    return data;
}
