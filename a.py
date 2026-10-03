#!/usr/bin/env python3
"""Reporte de gasto WeShip (replica de `node src/index.js report`).

Uso:
    export WESHIP_HOST=...        # host de la API, sin https://
    export WESHIP_TOKEN=...       # valor del header authorization
    python weship_report.py                                  # semana ISO anterior
    python weship_report.py --start 2026-09-14 --end 2026-09-20
"""
import argparse
import os
import sys
from collections import defaultdict
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo

import requests

TZ = ZoneInfo("America/Mexico_City")
LIMIT = 200

# Periodo del reporte (YYYY-MM-DD, ambos inclusivos).
# Déjalos en None para usar la semana ISO anterior.
START_DATE = "2026-09-01"
END_DATE = "2026-09-30"


def last_iso_week(today):
    monday = today - timedelta(days=today.weekday() + 7)
    return monday, monday + timedelta(days=6)


def fetch_all(host, token, start, end):
    headers = {"Weship-API-Version": "1.0", "authorization": token}
    txs, seen, skip = [], set(), 0
    while True:
        r = requests.get(
            f"https://{host}/transaction/invoices",
            headers=headers,
            timeout=30,
            params={
                "limit": LIMIT,
                "skip": skip,
                "type": "all",
                "startDate": start.isoformat(),
                "endDate": end.isoformat(),
            },
        )
        r.raise_for_status()
        data = r.json(parse_float=Decimal)
        page = [t for t in data.get("transactions", []) if t["t_id"] not in seen]
        if not page:  # vacía o sin nada nuevo -> terminamos
            break
        seen.update(t["t_id"] for t in page)
        txs.extend(page)
        nxt = data.get("nextPage")
        if not nxt:
            break
        # nextPage parece ser el siguiente skip; si no, avanzamos por lo recibido
        ok = isinstance(nxt, int) and not isinstance(nxt, bool) and nxt > skip
        skip = nxt if ok else skip + len(page)
    return txs


def balance_gaps(txs):
    """Cuenta saltos entre t_balance consecutivos (posibles huecos de paginación)."""
    rows = sorted(txs, key=lambda t: t["t_id"], reverse=True)
    n = 0
    for new, old in zip(rows, rows[1:]):
        if new["t_balance"] is None or old["t_balance"] is None:
            continue
        if abs(old["t_balance"] + new["t_amount"] - new["t_balance"]) > Decimal("0.01"):
            n += 1
    return n


def money(x):
    s = f"${abs(x):,.2f}"
    return f"-{s}" if x < 0 else s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", help="YYYY-MM-DD (default: lunes de la semana ISO anterior)")
    ap.add_argument("--end", help="YYYY-MM-DD (default: domingo de esa semana)")
    args = ap.parse_args()


    host, token = 'api.weship.com', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIzNjksImEiOjEwLCJvIjo0NjQ2LCJpYXQiOjE3OTA5NzUyNTgsImV4cCI6MTc5MDk5MzI1OH0.KudCxvr6N-F_xfFao2nkB8dwMpPB9O2gjxsCG9zNRjk'

    if not host or not token:
        sys.exit("Faltan WESHIP_HOST y/o WESHIP_TOKEN")

    s, e = args.start or START_DATE, args.end or END_DATE
    if s and e:
        d1, d2 = date.fromisoformat(s), date.fromisoformat(e)
    else:
        d1, d2 = last_iso_week(datetime.now(TZ).date())
    start = datetime.combine(d1, time(0, 0, 0), TZ)
    end = datetime.combine(d2, time(23, 59, 59), TZ)

    txs = fetch_all(host, token, start, end)

    by = defaultdict(lambda: {"pagado": Decimal(0), "reemb": Decimal(0), "n": 0})
    for t in txs:
        a, d = t["t_amount"], by[t["t_type"]]
        d["n"] += 1
        if a < 0:
            d["pagado"] += -a
        else:
            d["reemb"] += a

    pagado = sum((d["pagado"] for d in by.values()), Decimal(0))
    reemb = sum((d["reemb"] for d in by.values()), Decimal(0))

    bar = "=" * 70
    print(bar)
    print("  WeShip — reporte de gasto")
    print(bar)
    print(f"Periodo:     {d1} → {d2} (semana ISO, America/Mexico_City)")
    print(f"API range:   {start.isoformat()} → {end.isoformat()}")
    print(f"Txs usadas:  {len(txs)}")
    print()
    print(f"Total pagado:      {money(pagado)}")
    print(f"Total reembolsado: {money(reemb)}")
    print(f"Neto monedero:     {money(pagado - reemb)}")

    print(f"Neto monedero:     {money(reemb - pagado)}")
    print()
    print("Desglose por tipo:")
    for name, d in sorted(by.items(), key=lambda kv: (kv[1]["pagado"], kv[1]["n"]), reverse=True):
        neto = d["reemb"] - d["pagado"]
        print(f"  • {name:<22} pagado {money(d['pagado']):>11}  neto {money(neto):>11}  ({d['n']} txs)")
    print(bar)

    gaps = balance_gaps(txs)
    if gaps:
        print(f"\n⚠ {gaps} salto(s) en t_balance entre transacciones consecutivas: "
              "puede faltar alguna transacción (revisa paginación).")


if __name__ == "__main__":
    main()