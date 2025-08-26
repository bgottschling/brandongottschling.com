import type { ComponentType } from 'react'

// Minimal map shape compatible with MDX "components" prop
export type LocalMDXComponents = Record<string, ComponentType<unknown>>