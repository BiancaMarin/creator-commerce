**Avatar** — round identity chip for customer/order rows and menus.

```jsx
<Avatar name="Amara Okafor" />
<Avatar name="Leo Nakamura" src="/photo.jpg" size="lg" />
```

Renders the image when `src` is set, otherwise the first two initials on a muted circle. Sizes `sm · md · lg`.

**Intentional addition** — the dashboard draws initials circles inline; extracted here since order/customer templates reuse it.
