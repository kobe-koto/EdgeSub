async function RequestInfo (context) {
    const Path = (new URL(context.request.url)).pathname;
    console.info("[Main] Processing request...")
    console.info(`[Main] Request type: ${Path}`)

    return await context.next();
}

async function PerformanceCounting (context) {
    const __startTime = performance.now();

    const response = await context.next();
    
    console.info(`[PerformanceCounting] we've done this glory, totally wasting ${performance.now() - __startTime}ms.`)

    return response;
}

export const onRequest = [RequestInfo, PerformanceCounting];