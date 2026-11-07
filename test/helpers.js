// Minimal fetch mock. `handler(url)` returns { status, body, headers }.
export const mockFetch = (handler) => {
  const calls = []
  const fn = async (url, init) => {
    calls.push({ url: String(url), init })
    const { status = 200, body = [], headers = {}, statusText = '' } =
      (await handler(String(url), calls.length)) ?? {}
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
      statusText,
      headers
    })
  }
  fn.calls = calls
  return fn
}
