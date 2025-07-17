# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

IMPORTANT: ALWAYS vet new npm packages using `vet` MCP server before installing or suggesting them.

## Development Commands

### Package Manager

- Use `pnpm` instead of `npm` for all package operations
- Configure buf schema registry: `pnpm config set @buf:registry https://buf.build/gen/npm/v1/`

### Common Commands

- **Development server**: `pnpm dev` (runs on http://localhost:3000)
- **Build**: `pnpm build`
- **Production start**: `pnpm start`
- **Lint**: `pnpm lint` (Next.js ESLint)
- **Tests**: `pnpm test` (Vitest with React Testing Library)
- **Test UI**: `pnpm test --ui` (Vitest UI)
- **Format**: Prettier runs automatically via lint-staged on commit

### Prerequisites

- Node.js 22.11.0 (see `.tool-versions`)
- pnpm 9.15.4+
- ASDF for version management (optional)

## Application Architecture

### Core Purpose

**vetpkg.dev** is a Next.js 15 application providing open source package security analysis tools with five main features:

1. **Package Security Insight** (`/`) - Main package analyzer
2. **vet Report Visualization** (`/vr`) - JSON report viewer
3. **GitHub Actions Integration** (`/gha`) - CI/CD bot setup
4. **Malware Analysis** (`/mal`) - Threat detection records
5. **Star Scout** (`/starscout`) - Fake GitHub star detection

### Technology Stack

- **Frontend**: Next.js 15 App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Backend**: gRPC via ConnectRPC (@connectrpc/connect)
- **Testing**: Vitest with React Testing Library, jsdom
- **Monitoring**: Sentry for error tracking
- **Authentication**: GitHub OAuth

### Key Architecture Patterns

#### Server Actions Pattern

Each feature uses Next.js server actions (`actions.ts` files) for backend communication:

- `/v/[ecosystem]/[name]/[version]/actions.ts` - Package analysis
- `/starscout/actions.ts` - Star analysis
- `/gha/actions.ts` - GitHub integration
- `/mal/actions.ts` - Malware records

#### RPC Client Architecture (`/lib/rpc/`)

- Centralized gRPC client with authentication
- Memoized transport layer for performance
- Environment-based API configuration
- Multi-tenant support with headers

#### Component Organization

```
/components/
├── app/          # App-level components (header, footer)
├── ui/           # Reusable UI components (shadcn/ui based)
└── [feature]/    # Feature-specific components
```

### API Integration

- **SafeDep Insights API**: Package security analysis via gRPC
- **SafeDep Malware API**: Threat detection via gRPC
- **GitHub API**: Repository access and OAuth via Octokit
- **Data Sources**: OpenSSF Scorecard, OSV vulnerabilities, deps.dev metadata

### Path Aliases

- `@/*` maps to `./src/*`

### Environment Configuration

- Uses environment variables for API keys and configuration
- Sentry integration for error tracking
- Multi-environment support (development/production)

### Testing Configuration

- Vitest with jsdom environment
- React Testing Library for component testing
- Setup files: `setupFiles.ts`
- Global test configuration in `vitest.config.mts`

### Code Quality

- ESLint with Next.js and Prettier configurations
- Husky for git hooks
- lint-staged for pre-commit formatting
- TypeScript strict mode enabled

## Important Notes

### Package Analysis Routes

Dynamic routes follow pattern: `/v/[ecosystem]/[name]/[version]`

- Supports npm, PyPI, Maven, RubyGems, Go, PHP Composer
- Each route has dedicated components for dependency graphs, diff viewing, and malware analysis

### GitHub Integration

- OAuth-based authentication for repository access
- Automated PR creation for CI/CD setup
- Star analysis for fake star detection

### Data Visualization

- Recharts for charts and graphs
- React D3 Graph for dependency visualization
- CodeMirror for code display
- Interactive security dashboards

### Security Considerations

- Environment variable configuration for sensitive data
- OAuth-based authentication
- gRPC with authentication headers
- Error boundary implementations
