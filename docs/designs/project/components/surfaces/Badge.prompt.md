**Badge** — pill-shaped status label used in tables and detail headers (order status, product Draft/Published).

```jsx
<Badge variant="success">paid</Badge>
<Badge variant="warning">pending</Badge>
<Badge variant="neutral">refunded</Badge>
```

Fully rounded, capitalized, soft tinted background. Map state → variant: paid/published→`success`, pending→`warning`, failed→`destructive`, refunded/draft→`neutral`.

**Intentional addition** — the product renders status pills inline (no Badge primitive is installed yet); factored out here because the pattern recurs across the list & detail templates.
