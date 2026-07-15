**Button** — the primary action control across Creator Commerce; use for form submits, page actions ("New product"), and links styled as buttons (`variant="link"` / `outline`).

```jsx
<Button>Save</Button>
<Button variant="outline" size="sm"><PlusIcon/> New product</Button>
<Button variant="ghost" size="icon-sm" aria-label="More"><DotsIcon/></Button>
```

Variants: `default` (teal), `outline`, `secondary`, `ghost`, `destructive` (soft red), `link`. Sizes: `xs · sm · md · lg` and square `icon · icon-sm · icon-lg`. Fully rounded (radius-4xl); icons auto-size to 1rem. Pairs an `svg` child with text via the built-in gap.
