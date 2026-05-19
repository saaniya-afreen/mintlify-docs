import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const docusaurusDocs = path.join(root, '..', 'docs-site', 'docs');
const docusaurusJa = path.join(
  root,
  '..',
  'docs-site',
  'i18n',
  'ja',
  'docusaurus-plugin-content-docs',
  'current',
);

function convertAdmonitions(text) {
  const types = {tip: 'Tip', warning: 'Warning', info: 'Info', note: 'Note'};
  return text.replace(
    /:::(tip|warning|info|note)\s*([^\n]*)\n([\s\S]*?):::/g,
    (_, type, title, body) => {
      const tag = types[type] || 'Note';
      const label = title.trim();
      const inner = body.trim();
      if (label) {
        return `<${tag} title="${label}">\n${inner}\n</${tag}>`;
      }
      return `<${tag}>\n${inner}\n</${tag}>`;
    },
  );
}

function fixLinks(text, {locale} = {}) {
  let out = text
    .replace(/\]\(\.\/concepts\//g, '](/concepts/')
    .replace(/\]\(\/api\//g, '](/api-reference/')
    .replace(/\]\(\/\)/g, '](/index)');

  if (locale === 'jp') {
    out = out
      .replace(/\]\(\/concepts\//g, '](/jp/concepts/')
      .replace(/\]\(\/index\)/g, '](/jp/index)')
      .replace(
        /\]\(\/api-reference\/overview\)/g,
        '](/jp/api-reference/overview)',
      );
  }

  return out;
}

function stripDocusaurusFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return {meta: {}, body: text};
  const raw = match[1];
  const body = match[2];
  const meta = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) meta[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return {meta, body};
}

function toMdx(srcPath, destPath, titleOverride, options = {}) {
  const raw = fs.readFileSync(srcPath, 'utf8');
  const {meta, body} = stripDocusaurusFrontmatter(raw);
  let content = body.trim();
  content = convertAdmonitions(content);
  content = fixLinks(content, options);
  content = content.replace(/^# .+\n\n?/, '');

  const title = titleOverride || meta.title || path.basename(srcPath, '.md');
  const description =
    meta.description ||
    content.split('\n').find((l) => l.trim() && !l.startsWith('<') && !l.startsWith('```')) ||
    title;

  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${String(description).slice(0, 120).replace(/"/g, '\\"')}"
---

`;

  fs.mkdirSync(path.dirname(destPath), {recursive: true});
  fs.writeFileSync(destPath, frontmatter + content + '\n');
}

const enPages = [
  {src: 'getting-started.md', dest: 'index.mdx', title: 'Getting Started'},
  {src: 'introduction.md', dest: 'introduction.mdx'},
  {src: 'concepts/architecture.md', dest: 'concepts/architecture.mdx'},
  {src: 'concepts/authentication.md', dest: 'concepts/authentication.mdx'},
  {src: 'concepts/integrations.md', dest: 'concepts/integrations.mdx'},
  {src: 'concepts/agents.md', dest: 'concepts/agents.mdx'},
  {src: 'troubleshooting.md', dest: 'troubleshooting.mdx'},
];

const jaPages = [
  {
    src: 'getting-started.md',
    dest: 'jp/index.mdx',
    title: 'クイックスタート',
    jaRoot: true,
  },
  {src: 'introduction.md', dest: 'jp/introduction.mdx', jaRoot: true},
  {
    src: 'concepts/architecture.md',
    dest: 'jp/concepts/architecture.mdx',
    jaRoot: true,
  },
  {
    src: 'concepts/authentication.md',
    dest: 'jp/concepts/authentication.mdx',
    jaRoot: true,
  },
  {
    src: 'concepts/integrations.md',
    dest: 'jp/concepts/integrations.mdx',
    jaRoot: true,
  },
  {src: 'concepts/agents.md', dest: 'jp/concepts/agents.mdx', jaRoot: true},
];

for (const page of enPages) {
  toMdx(
    path.join(docusaurusDocs, page.src),
    path.join(root, page.dest),
    page.title,
  );
  console.log('EN', page.dest);
}

for (const page of jaPages) {
  const base = page.jaRoot ? docusaurusJa : docusaurusDocs;
  toMdx(path.join(base, page.src), path.join(root, page.dest), page.title, {
    locale: 'jp',
  });
  console.log('JP', page.dest);
}

console.log('API reference is generated from openapi/openapi.yaml — not synced from markdown.');
console.log('Done.');
