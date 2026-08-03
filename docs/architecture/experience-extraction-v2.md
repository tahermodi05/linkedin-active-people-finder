# Experience Extraction V2

## Single Position

Company
└── Position

Return:

```json
{
  "company": "...",
  "positions": [
    {
      "role": "...",
      "startDate": "...",
      "endDate": "...",
      "current": true
    }
  ]
}
```

---

## Multiple Positions

Company
├── Position 1
├── Position 2
├── Position 3

Return:

```json
{
  "company": "...",
  "positions": [
    { ... },
    { ... },
    { ... }
  ]
}
```

---

The company is the parent object.

Each role is a child object.

Current company = company containing a current position.

Current role = current position inside that company.