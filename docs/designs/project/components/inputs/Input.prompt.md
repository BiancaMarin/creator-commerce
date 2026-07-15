**Input** — the standard single-line text field for auth and settings forms. Pair with a plain `<label htmlFor>` (the kit has no separate Label primitive) and surface errors below.

```jsx
<label htmlFor="email">Email</label>
<Input id="email" type="email" placeholder="you@example.com" />
<Input aria-invalid placeholder="Invalid" />
```

Soft translucent fill, radius-3xl. Set `aria-invalid` to render the destructive focus ring. Use `type` as normal (`password`, `email`, …).
