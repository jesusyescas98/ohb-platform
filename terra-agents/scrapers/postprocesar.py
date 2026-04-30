#!/usr/bin/env python3
"""
Terra Agents — Post-procesador de prospectos
Lee prospectos-raw.csv y genera:
  - prospectos-con-tel.csv   (solo los que tienen teléfono)
  - prospectos-sin-tel.csv   (para enriquecimiento manual)
  - reporte.txt              (estadísticas)

Uso:
    python postprocesar.py
"""

import csv
import re
from collections import Counter
from pathlib import Path
from datetime import datetime

RAW = Path(__file__).parent / "prospectos-raw.csv"
CON_TEL = Path(__file__).parent / "prospectos-con-tel.csv"
SIN_TEL = Path(__file__).parent / "prospectos-sin-tel.csv"
REPORTE = Path(__file__).parent / "reporte.txt"

PRIORIDAD_CIUDAD = {
    "Ciudad Juárez": 1,
    "El Paso TX":    2,
    "Chihuahua":     3,
    "CDMX":          4,
    "Monterrey":     5,
    "Guadalajara":   6,
    "Tijuana":       7,
}


def score_prospecto(row: dict) -> int:
    """Score de prioridad de contacto (mayor = mejor lead)."""
    score = 0
    score += 30 if row.get("telefono") else 0
    score += 20 if row.get("agencia") else 0
    score += 10 if int(row.get("num_propiedades") or 0) >= 5 else 0
    score += 5 if row.get("zona_dominante") else 0
    score += 5 if row.get("es_bilingual", "").lower() == "true" else 0
    score -= PRIORIDAD_CIUDAD.get(row.get("ciudad_target", ""), 5) * 2
    return score


def whatsapp_link(telefono: str) -> str:
    """Genera link wa.me para contacto directo."""
    digits = re.sub(r"[^\d]", "", telefono)
    if digits.startswith("52") and len(digits) == 12:
        return f"https://wa.me/{digits}"
    if len(digits) == 10:
        return f"https://wa.me/52{digits}"
    return f"https://wa.me/{digits}" if digits else ""


def main():
    if not RAW.exists():
        print(f"❌ No encontré {RAW}")
        print("Ejecuta primero: python scraper.py")
        return

    rows = []
    with open(RAW, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            row["score"] = score_prospecto(row)
            row["wa_link"] = whatsapp_link(row.get("telefono", ""))
            rows.append(row)

    # Ordenar por score desc
    rows.sort(key=lambda r: r["score"], reverse=True)

    con_tel = [r for r in rows if r.get("telefono")]
    sin_tel = [r for r in rows if not r.get("telefono")]

    fieldnames = list(rows[0].keys()) if rows else []

    # ── Guardar con teléfono ──
    with open(CON_TEL, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(con_tel)
    print(f"✅ {CON_TEL.name}: {len(con_tel)} prospectos con teléfono")

    # ── Guardar sin teléfono ──
    with open(SIN_TEL, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(sin_tel)
    print(f"📋 {SIN_TEL.name}: {len(sin_tel)} para enriquecimiento manual")

    # ── Reporte ──
    por_ciudad = Counter(r["ciudad_target"] for r in rows)
    por_fuente = Counter(r["fuente"] for r in rows)
    bilingues = sum(1 for r in rows if r.get("es_bilingual", "").lower() == "true")
    top5 = rows[:5]

    reporte = f"""
TERRA AGENTS — REPORTE DE PROSPECTOS
Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}
{'═'*50}

TOTALES
  Total prospectos:     {len(rows)}
  Con teléfono:         {len(con_tel)} ({round(len(con_tel)/len(rows)*100) if rows else 0}%)
  Sin teléfono:         {len(sin_tel)}
  Bilingues (El Paso):  {bilingues}

POR CIUDAD
{''.join(f'  {c:<22} {n:>3}' + chr(10) for c, n in sorted(por_ciudad.items(), key=lambda x: PRIORIDAD_CIUDAD.get(x[0], 9)))}
POR FUENTE
{''.join(f'  {f:<22} {n:>3}' + chr(10) for f, n in por_fuente.items())}
TOP 5 MEJORES LEADS
{''.join(f'  {i+1}. {r["nombre"][:30]:<30} | {r["ciudad_target"]:<15} | tel: {r["telefono"] or "–"}' + chr(10) for i, r in enumerate(top5))}
ARCHIVOS GENERADOS
  {CON_TEL.name}  ← Enviar campana WhatsApp
  {SIN_TEL.name}  ← Enriquecer manualmente
  {REPORTE.name}  ← Este reporte
"""

    with open(REPORTE, "w", encoding="utf-8") as f:
        f.write(reporte)

    print(reporte)


if __name__ == "__main__":
    main()
