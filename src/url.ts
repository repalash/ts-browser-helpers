/**
 * Get URL query parameter. If not found, return default value. Similar to PHP's $_GET
 * @param p - parameter name to get
 * @param def - default value if parameter not found
 *
 * @category URL
 */
export function getUrlQueryParam(p: string, def: any = null) {
    const url = new URL(window.location.href)
    return url.searchParams.get(p) ?? def
}

/**
 * Set URL query parameter. If value is null, remove parameter. Similar to PHP's $_GET
 * @param p - parameter name to set
 * @param v - parameter value or null to remove
 * @param reload - reload page after setting parameter, default false. If false, `history.replaceState` is used.
 *
 * @category URL
 */
export function setUrlQueryParam(p: string, v: string|null, reload = false) { // pass v = null to remove
    const params = new URLSearchParams(location.search)
    if (v === null || v === undefined) {
        if (params.has(p))
            params.delete(p)
    } else params.set(p, v)
    if (!reload)
        window.history.replaceState({}, '', '?' + params.toString()) // todo: check if default state and set to /
    else
        window.location.search = params.toString()
}


/**
 * Join path parts with separator. Similar to PHP's pathJoin
 * @param parts - path parts
 * @param separator - separator, default '/'
 */
export function pathJoin(parts: string[], separator: string = '/'): string {
    // const replace = new RegExp(separator + '{1,}', 'g')
    return parts.join(separator)// .replace(replace, separator) //todo fix: replace breaks https://raw to https:/raw
}
