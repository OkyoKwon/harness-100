# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-05

### Added

- **Catalog browsing** with 10 categories, fuzzy search, and multi-sort (number / popularity / name)
- **3 setup methods**: Browser direct setup (File System Access API), ZIP download, CLI copy
- **Conflict detection and merge** for existing `.claude/` files (overwrite / skip / merge)
- **Customization panel** to edit agent names, roles, and output templates before setup
- **Harness Composer** to combine agents from multiple harnesses into custom workflows
- **Popularity ranking** showing community top 10 harnesses
- **Favorites** with local persistence and dedicated favorites tab
- **Multilingual support** for English and Korean with IP-based locale detection
- **Dark mode** with system preference sync and manual toggle
- **Mobile-optimized UI** with hamburger menu, safe areas, and touch-friendly targets
- **Post-installation usage guide** sections on harness detail pages
- **Footer** with GitHub link
- **Comprehensive test suite** achieving 92%+ code coverage (Vitest + Testing Library + MSW)
- **Storybook** with component stories and interaction tests
- **Static export** deployment to Vercel

### Technical

- Next.js 16 with App Router and Static Export
- TypeScript 6 with strict mode
- Tailwind CSS 4 for styling
- pnpm 10 as package manager
- Bilingual harness data in `public/data/{en,ko}/`
- Seed script to fetch harness data from GitHub

[1.0.0]: https://github.com/OkyoKwon/harness-100/releases/tag/v1.0.0
