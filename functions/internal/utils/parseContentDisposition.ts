export function parseContentDisposition(RawContentDispositionHeader: string): string {
    if (!RawContentDispositionHeader || !RawContentDispositionHeader.toLowerCase().startsWith('attachment')) {
        console.warn('Invalid Content-Disposition header');
        return null;
    }

    // Match filename*= (RFC 5987)
    const filenameStarMatch = RawContentDispositionHeader.match(/filename\*\s*=\s*([^'"]*)''([^;]+)/i);
    if (filenameStarMatch) {
        try {
            const encoding = filenameStarMatch[1].toLowerCase();
            const filenameEncoded = filenameStarMatch[2];
            return decodeURIComponent(filenameEncoded);
        } catch (err) {
            return null;
        }
    }

    // Match filename= (quoted or unquoted)
    const filenameMatch = RawContentDispositionHeader.match(/filename\s*=\s*("?)([^";]+)\1/i);
    if (filenameMatch) {
        return filenameMatch[2];
    }

    return null; // No fucking filename found
}
