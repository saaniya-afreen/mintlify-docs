# OneInbox Docs (Mintlify)

Vapi-style documentation with **Documentation** and **API Reference** tabs, plus EN / 日本語.

## Run locally

```bash
cd mintlify
npm install
npm run dev
```

Open **http://localhost:3333**

## Structure (like Vapi)

| Section | Pages |
| --- | --- |
| **Get started** | Introduction → Build first agent → Web calls → Phone calls |
| **Core concepts** | How it works, Resources, Auth, Integrations, Agents |
| **API Reference** | Separate tab — endpoints grouped by resource |

## Edit content

Main pages are hand-written in `mintlify/` (not auto-synced). To refresh API endpoint pages from Docusaurus source:

```bash
npm run sync
```

Then re-apply any manual overview edits if needed.

## Deploy

Connect repo at [dashboard.mintlify.com](https://dashboard.mintlify.com) via GitHub App. Set docs path to `mintlify`.

Static export: `npx mintlify export --output oneinbox-docs.zip`
