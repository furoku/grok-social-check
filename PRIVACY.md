# Privacy Policy

Last verified: 2026-08-30

## Overview

Grok Social Check is a local Chrome extension that sends the text of a selected X or Threads post to the xAI API only after the user presses the analysis button.

## Data handled

- **xAI API key:** Stored in `chrome.storage.local`. Access is restricted to trusted extension contexts. Version 1.0.0 and earlier used `chrome.storage.sync`; the current version migrates any legacy key once and deletes the synchronized copy.
- **Post text:** Sent to `https://api.x.ai/` only for the post the user explicitly asks to analyze.
- **Settings:** Model and cooldown settings are stored locally with the API key.
- **Analysis result:** Rendered on the current page. The extension does not operate a server or retain a history database.

## Data sharing

Post text and the API key are sent to xAI to perform the requested analysis. xAI's own terms and privacy policy govern that processing. No data is sent to a server operated by this project's maintainer, and no analytics or telemetry SDK is included.

## Retention and deletion

Local settings remain until the user clears them, presses **APIキーを削除**, or uninstalls the extension. The delete action removes both the current local key and any legacy synchronized copy.

## Important limitation

The displayed result is AI-generated reference analysis, not an official fact check. It may contain factual errors, missing context, or political bias. Verify consequential claims against primary sources.

## Contact

For privacy or security concerns, follow [SECURITY.md](SECURITY.md). Never include an API key or private post content in a public issue.
