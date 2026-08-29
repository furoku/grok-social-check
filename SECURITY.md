# Security Policy

## Supported version

Security fixes target the latest source on the default branch. The extension is distributed as source and locally generated ZIP files; there is no Chrome Web Store release.

## Reporting a vulnerability

Open a GitHub issue with a minimal, non-sensitive description and ask for a private reporting channel before sharing reproduction details. Do not post API keys, authorization headers, private posts, browsing data, screenshots containing personal information, or raw xAI responses in a public issue.

Include the affected commit, Chrome version, expected behavior, observed impact, and whether the issue can expose data or trigger paid API calls.

## Security boundary

Grok Social Check must:

- send post text only after an explicit button press;
- send data only to `https://api.x.ai/`;
- keep the xAI API key in extension-local storage restricted to trusted extension contexts;
- remove legacy copies from `chrome.storage.sync`;
- avoid developer-operated servers, telemetry, and background collection;
- treat all AI output as unverified reference analysis.

If an API key may have been exposed, revoke it in the xAI console before creating a replacement.
