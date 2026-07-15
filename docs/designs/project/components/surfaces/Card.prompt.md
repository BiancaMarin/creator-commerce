**Card** — the base surface everywhere: KPI tiles, dashboard panels, auth card, list containers. Compose from the sub-parts; use `size="sm"` for dense stat tiles.

```jsx
<Card size="sm">
  <CardHeader hasAction>
    <CardDescription>Revenue</CardDescription>
    <CardTitle style={{fontSize:"var(--text-2xl)"}}>$48,120</CardTitle>
    <CardAction><span className="tile-icon">…</span></CardAction>
  </CardHeader>
  <CardFooter style={{gap:".375rem",fontSize:"var(--text-xs)"}}>+12.4% vs last 30 days</CardFooter>
</Card>
```

Sub-parts: `CardHeader` (pass `hasAction` when using `CardAction`), `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`. Large radius, soft shadow + hairline ring. Border dividers inside content are done with `Separator`.
