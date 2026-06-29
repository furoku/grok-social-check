# Progress log

API キー・トークンは書かない。スクショは個人情報をマスクする。

## Template

```
### YYYY-MM-DD — Dx
- check: smoke / test / smoke:chrome (pass|fail|skip)
- manual: M1|M2|M3 (pass|fail|—)
- drift: none | <signal from LOOP_GOALS §5>
- next: D?
```

---

### 2026-06-29 — D0+D1
- check: smoke pass, test 6/6 pass, smoke:chrome skip (VM に Google Chrome なし)
- manual: —
- drift: none
- next: D2 on PO PC (`npm run check:pc`)