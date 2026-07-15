**Tooltip** — dark hint bubble on hover/focus; used on icon-only buttons and collapsed sidebar items.

```jsx
<Tooltip label="Export CSV">
  <Button variant="ghost" size="icon-sm" aria-label="Export"><ExportIcon/></Button>
</Tooltip>
```

Wraps its trigger; the bubble is positioned above and centered. CSS-only (hover/focus-within) — no JS state needed.
