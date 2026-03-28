export async function apiPost(
  url: string,
  body: object
): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-nexagent-request': 'true',
    },
    body: JSON.stringify(body),
  })
}

export async function apiGet(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      'x-nexagent-request': 'true',
    },
  })
}
