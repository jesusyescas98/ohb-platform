#!/usr/bin/env python3
"""
Terra Agents — Prospecting Scraper
Fuentes: Inmuebles24 + Vivanuncios
Output:  scrapers/prospectos-raw.csv

Uso:
    pip install playwright asyncio
    playwright install chromium
    python scraper.py

Tiempo estimado: 60-90 minutos para 210 prospectos.
"""

import asyncio
import csv
import json
import random
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional

from playwright.async_api import (
    async_playwright,
    Page,
    BrowserContext,
    TimeoutError as PWTimeout,
)

# ══════════════════════════════════════════════════════════════
# CONFIGURACIÓN
# ══════════════════════════════════════════════════════════════

OUTPUT_CSV = Path(__file__).parent / "prospectos-raw.csv"

# Objetivos por ciudad
TARGETS = {
    "Ciudad Juárez":   {"goal": 50,  "region": "mx", "i24_slug": "ciudad-juarez-chihuahua",  "vv_slug": "chihuahua/ciudad-juarez"},
    "Chihuahua":       {"goal": 30,  "region": "mx", "i24_slug": "chihuahua-chihuahua",       "vv_slug": "chihuahua/chihuahua"},
    "El Paso TX":      {"goal": 20,  "region": "us", "i24_slug": "ciudad-juarez-chihuahua",   "vv_slug": "chihuahua/ciudad-juarez"},  # bilingual agents border
    "CDMX":            {"goal": 40,  "region": "mx", "i24_slug": "distrito-federal",           "vv_slug": "distrito-federal"},
    "Monterrey":       {"goal": 30,  "region": "mx", "i24_slug": "monterrey-nuevo-leon",       "vv_slug": "nuevo-leon/monterrey"},
    "Guadalajara":     {"goal": 20,  "region": "mx", "i24_slug": "guadalajara-jalisco",        "vv_slug": "jalisco/guadalajara"},
    "Tijuana":         {"goal": 20,  "region": "mx", "i24_slug": "tijuana-baja-california",   "vv_slug": "baja-california/tijuana"},
}

RATE_MIN = 3.0   # segundos entre requests
RATE_MAX = 5.5
BLOCK_PAUSE = 60  # pausa si detecta anti-scraping
MAX_RETRIES = 3
HEADLESS = False  # True para correr en background (más detectable)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.122 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
]

VIEWPORTS = [
    {"width": 1920, "height": 1080},
    {"width": 1440, "height": 900},
    {"width": 1366, "height": 768},
    {"width": 1280, "height": 800},
]


# ══════════════════════════════════════════════════════════════
# MODELO DE DATOS
# ══════════════════════════════════════════════════════════════

@dataclass
class Prospecto:
    nombre: str = ""
    telefono: str = ""
    agencia: str = ""
    num_propiedades: int = 0
    zona_dominante: str = ""
    ciudad_target: str = ""
    fuente: str = ""          # "inmuebles24" | "vivanuncios"
    link_perfil: str = ""
    ultima_publicacion: str = ""
    email: str = ""
    es_bilingual: bool = False
    fecha_scrape: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M"))

    def es_valido(self) -> bool:
        return bool(self.nombre and self.nombre != "N/A" and len(self.nombre) > 2)

    def tiene_contacto(self) -> bool:
        return bool(self.telefono or self.email)


# ══════════════════════════════════════════════════════════════
# STEALTH & BROWSER SETUP
# ══════════════════════════════════════════════════════════════

STEALTH_JS = """
// Elimina rastros de Playwright/automation
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
Object.defineProperty(navigator, 'languages', { get: () => ['es-MX', 'es', 'en-US', 'en'] });
window.chrome = { runtime: {} };
Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
"""


async def new_context(playwright, rotate_ua: bool = True) -> BrowserContext:
    ua = random.choice(USER_AGENTS) if rotate_ua else USER_AGENTS[0]
    vp = random.choice(VIEWPORTS)
    browser = await playwright.chromium.launch(
        headless=HEADLESS,
        args=[
            "--no-sandbox",
            "--disable-blink-features=AutomationControlled",
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
        ],
    )
    ctx = await browser.new_context(
        user_agent=ua,
        viewport=vp,
        locale="es-MX",
        timezone_id="America/Mexico_City",
        java_script_enabled=True,
        extra_http_headers={
            "Accept-Language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124"',
            "sec-ch-ua-platform": '"Windows"',
        },
    )
    await ctx.add_init_script(STEALTH_JS)
    return ctx, browser


async def human_delay(min_s: float = RATE_MIN, max_s: float = RATE_MAX):
    """Pausa aleatoria tipo humano."""
    await asyncio.sleep(random.uniform(min_s, max_s))


async def human_scroll(page: Page):
    """Scroll gradual para simular lectura."""
    for _ in range(random.randint(2, 4)):
        await page.mouse.wheel(0, random.randint(300, 600))
        await asyncio.sleep(random.uniform(0.4, 1.0))


async def detect_block(page: Page) -> bool:
    """Detecta captcha o bloqueo."""
    url = page.url.lower()
    title = (await page.title()).lower()
    block_signals = ["captcha", "robot", "blocked", "cloudflare", "challenge", "access denied", "403"]
    return any(s in url or s in title for s in block_signals)


# ══════════════════════════════════════════════════════════════
# UTILIDADES DE EXTRACCIÓN
# ══════════════════════════════════════════════════════════════

def clean_phone(raw: str) -> str:
    """Normaliza teléfono a formato 10 dígitos o +52."""
    digits = re.sub(r"[^\d+]", "", raw)
    if not digits:
        return ""
    # Elimina prefijos internacionales conocidos
    if digits.startswith("+521") and len(digits) == 13:
        return digits
    if digits.startswith("521") and len(digits) == 13:
        return "+52" + digits[2:]
    if digits.startswith("52") and len(digits) == 12:
        return "+" + digits
    if len(digits) == 10:
        return "+52" + digits
    return digits if len(digits) >= 10 else ""


def clean_name(raw: str) -> str:
    return " ".join(raw.strip().split())


def extract_zone(text: str, city: str) -> str:
    """Extrae la colonia/zona más mencionada en el texto del perfil."""
    # Palabras clave de zonas comunes por ciudad
    zone_patterns = {
        "Ciudad Juárez": ["Lomas de Poleo", "Senderos", "Campestre", "Valle Dorado", "Misión", "Haciendas", "Zaragoza", "Satelite"],
        "Chihuahua":     ["Cumbres", "San Felipe", "Lomas", "Residencial", "Centro", "Altavista"],
        "CDMX":          ["Polanco", "Condesa", "Roma", "Coyoacán", "Narvarte", "Del Valle", "Tlalpan", "Satélite"],
        "Monterrey":     ["San Pedro", "Valle", "Cumbres", "Contry", "Miravalle", "Cintermex"],
        "Guadalajara":   ["Chapalita", "Providencia", "Zapopan", "Tlaquepaque", "Chapultepec", "Americana"],
        "Tijuana":       ["Chapultepec", "Otay", "Playas", "Zona Río", "Hipódromo", "La Cacho"],
    }
    zones = zone_patterns.get(city, [])
    for z in zones:
        if z.lower() in text.lower():
            return z
    return ""


def is_el_paso_agent(text: str, phone: str) -> bool:
    """Identifica agentes bilingüe frontera El Paso/Juárez."""
    el_paso_signals = ["el paso", "texas", "tx", "915", "bilingual", "bilingüe", "english", "inglés"]
    combined = (text + " " + phone).lower()
    return any(s in combined for s in el_paso_signals) or phone.startswith("+1915") or "+1 (915)" in phone


# ══════════════════════════════════════════════════════════════
# SCRAPER — INMUEBLES24
# ══════════════════════════════════════════════════════════════

class Inmuebles24Scraper:
    BASE = "https://www.inmuebles24.com"

    def __init__(self, page: Page):
        self.page = page

    async def scrape_city(self, ciudad: str, slug: str, goal: int) -> list[Prospecto]:
        """Scrape agentes de una ciudad en Inmuebles24."""
        prospectos = []
        page_num = 1

        # Primero intentar directorio de inmobiliarias
        prospectos += await self._scrape_agencias(ciudad, slug, goal)
        if len(prospectos) >= goal:
            return prospectos[:goal]

        # Complementar con listings directos si faltan
        needed = goal - len(prospectos)
        if needed > 0:
            prospectos += await self._scrape_listings(ciudad, slug, needed)

        return prospectos[:goal]

    async def _scrape_agencias(self, ciudad: str, slug: str, goal: int) -> list[Prospecto]:
        """Scrape directorio /inmobiliarias/."""
        prospectos = []
        url = f"{self.BASE}/inmobiliarias/{slug}/"

        for page_num in range(1, 8):
            paginated = f"{url}pagina-{page_num}.html" if page_num > 1 else url
            print(f"  [i24-agencias] {ciudad} p{page_num}: {paginated}")

            ok = await self._goto_safe(paginated)
            if not ok:
                break

            await human_scroll(self.page)

            # Extraer cards de agencias
            cards = await self.page.query_selector_all(
                "article.card-agency, div.agency-card, li[data-qa='agency-card'], div[class*='agency']"
            )

            if not cards:
                # Selector alternativo más genérico
                cards = await self.page.query_selector_all("div[data-id], article[data-agency-id]")

            if not cards:
                print(f"    [i24] Sin cards en p{page_num}, intentando siguiente fuente")
                break

            for card in cards:
                p = await self._extract_agency_card(card, ciudad)
                if p and p.es_valido():
                    prospectos.append(p)
                    print(f"    + {p.nombre} | {p.telefono or 'sin tel'} | {p.num_propiedades} props")

                if len(prospectos) >= goal:
                    break

            await human_delay()
            if len(prospectos) >= goal:
                break

        return prospectos

    async def _scrape_listings(self, ciudad: str, slug: str, goal: int) -> list[Prospecto]:
        """Extrae agentes únicos de listings de propiedades."""
        prospectos = []
        agentes_vistos = set()
        url = f"{self.BASE}/venta/{slug}/"

        for page_num in range(1, 10):
            paginated = f"{url}pagina-{page_num}.html" if page_num > 1 else url
            print(f"  [i24-listings] {ciudad} p{page_num}: {paginated}")

            ok = await self._goto_safe(paginated)
            if not ok:
                break

            await human_scroll(self.page)

            # Cards de propiedades
            prop_cards = await self.page.query_selector_all(
                "div[data-qa='posting-card'], article.posting-card, div.item-container"
            )

            for card in prop_cards:
                p = await self._extract_listing_agent(card, ciudad)
                if p and p.es_valido() and p.nombre not in agentes_vistos:
                    agentes_vistos.add(p.nombre)
                    prospectos.append(p)
                    print(f"    + {p.nombre} | {p.agencia}")

                if len(prospectos) >= goal:
                    break

            await human_delay()
            if len(prospectos) >= goal:
                break

        return prospectos

    async def _extract_agency_card(self, card, ciudad: str) -> Optional[Prospecto]:
        try:
            p = Prospecto(fuente="inmuebles24", ciudad_target=ciudad)

            # Nombre de la agencia/asesor
            for sel in ["h2", "h3", ".agency-name", "[data-qa='agency-name']", "span.name"]:
                el = await card.query_selector(sel)
                if el:
                    p.nombre = clean_name(await el.inner_text())
                    break

            if not p.nombre:
                return None

            # Teléfono
            for sel in ["a[href^='tel:']", ".phone", "[data-qa='phone']", "span.tel"]:
                el = await card.query_selector(sel)
                if el:
                    raw = await el.get_attribute("href") or await el.inner_text()
                    p.telefono = clean_phone(raw.replace("tel:", ""))
                    break

            # Número de propiedades
            for sel in ["span.count", ".properties-count", "[data-qa='properties-count']", "strong"]:
                el = await card.query_selector(sel)
                if el:
                    txt = await el.inner_text()
                    nums = re.findall(r"\d+", txt)
                    if nums:
                        p.num_propiedades = int(nums[0])
                        break

            # Link del perfil
            for sel in ["a[href*='/inmobiliaria/']", "a[href*='/agencia/']", "a"]:
                el = await card.query_selector(sel)
                if el:
                    href = await el.get_attribute("href")
                    if href:
                        p.link_perfil = href if href.startswith("http") else self.BASE + href
                        break

            # Zona dominante
            full_text = await card.inner_text()
            p.zona_dominante = extract_zone(full_text, ciudad)

            # Bilingual check para El Paso
            if ciudad == "El Paso TX":
                p.es_bilingual = is_el_paso_agent(full_text, p.telefono)

            return p if p.num_propiedades >= 3 or not p.num_propiedades else p

        except Exception as e:
            return None

    async def _extract_listing_agent(self, card, ciudad: str) -> Optional[Prospecto]:
        try:
            p = Prospecto(fuente="inmuebles24", ciudad_target=ciudad)

            # Agente/contacto en el listing
            for sel in ["span[data-qa='publisher-name']", ".publisher-name", "p.publisher"]:
                el = await card.query_selector(sel)
                if el:
                    p.nombre = clean_name(await el.inner_text())
                    break

            for sel in ["span[data-qa='real-estate-agency-name']", ".agency-name-listing"]:
                el = await card.query_selector(sel)
                if el:
                    p.agencia = clean_name(await el.inner_text())
                    break

            # Link a la propiedad (de donde sacaremos el perfil del agente)
            link_el = await card.query_selector("a[href*='/propiedades/'], a[href*='/inmueble/']")
            if link_el:
                href = await link_el.get_attribute("href")
                p.link_perfil = href if href and href.startswith("http") else (self.BASE + href if href else "")

            # Fecha de publicación
            for sel in ["span[data-qa='timestamp']", ".posting-date", "time"]:
                el = await card.query_selector(sel)
                if el:
                    p.ultima_publicacion = (await el.inner_text()).strip()[:30]
                    break

            # Zona del listing como zona dominante del agente
            for sel in ["span[data-qa='posting-location']", ".location", "h2.location"]:
                el = await card.query_selector(sel)
                if el:
                    p.zona_dominante = (await el.inner_text()).strip()[:50]
                    break

            full_text = await card.inner_text()
            if not p.zona_dominante:
                p.zona_dominante = extract_zone(full_text, ciudad)

            return p

        except Exception:
            return None

    async def _goto_safe(self, url: str) -> bool:
        """Navega con reintento y detección de bloqueo."""
        for attempt in range(MAX_RETRIES):
            try:
                await self.page.goto(url, wait_until="domcontentloaded", timeout=20_000)
                await asyncio.sleep(1.5)

                if await detect_block(self.page):
                    print(f"  ⚠ Bloqueo detectado. Pausa {BLOCK_PAUSE}s...")
                    await asyncio.sleep(BLOCK_PAUSE)
                    continue

                return True

            except PWTimeout:
                print(f"  ⚠ Timeout {url} (intento {attempt+1}/{MAX_RETRIES})")
                await asyncio.sleep(5)
            except Exception as e:
                print(f"  ⚠ Error: {e} (intento {attempt+1}/{MAX_RETRIES})")
                await asyncio.sleep(5)

        return False


# ══════════════════════════════════════════════════════════════
# SCRAPER — VIVANUNCIOS
# ══════════════════════════════════════════════════════════════

class VivanunciosScraper:
    BASE = "https://www.vivanuncios.com.mx"

    def __init__(self, page: Page):
        self.page = page

    async def scrape_city(self, ciudad: str, slug: str, goal: int) -> list[Prospecto]:
        prospectos = []
        agentes_vistos = set()

        # Vivanuncios no tiene directorio de agencias claro — scrapeamos listings
        urls_to_try = [
            f"{self.BASE}/s-venta-casas/{slug}/v1c1101l{self._get_location_id(ciudad)}p1",
            f"{self.BASE}/s-venta-departamentos/{slug}/v1c1102l{self._get_location_id(ciudad)}p1",
            f"{self.BASE}/inmuebles/{slug}/",
        ]

        for base_url in urls_to_try:
            for page_num in range(1, 6):
                url = base_url.replace("p1", f"p{page_num}") if page_num > 1 else base_url
                print(f"  [vv] {ciudad} p{page_num}: {url[:70]}...")

                ok = await self._goto_safe(url)
                if not ok:
                    break

                await human_scroll(self.page)

                # Selectors Vivanuncios (OLX-based)
                cards = await self.page.query_selector_all(
                    "li[data-aut-id='itemBox'], div[class*='ad-card'], article[class*='listing']"
                )

                if not cards:
                    break

                for card in cards:
                    p = await self._extract_card(card, ciudad)
                    if p and p.es_valido() and p.nombre not in agentes_vistos:
                        agentes_vistos.add(p.nombre)
                        prospectos.append(p)
                        print(f"    + {p.nombre} | {p.telefono or 'sin tel'}")

                    if len(prospectos) >= goal:
                        break

                await human_delay()
                if len(prospectos) >= goal:
                    break

            if len(prospectos) >= goal:
                break

        return prospectos[:goal]

    def _get_location_id(self, ciudad: str) -> str:
        """IDs aproximados de ubicación en Vivanuncios."""
        ids = {
            "Ciudad Juárez": "5012",
            "Chihuahua":     "5011",
            "El Paso TX":    "5012",
            "CDMX":          "6001",
            "Monterrey":     "5060",
            "Guadalajara":   "5026",
            "Tijuana":       "5002",
        }
        return ids.get(ciudad, "")

    async def _extract_card(self, card, ciudad: str) -> Optional[Prospecto]:
        try:
            p = Prospecto(fuente="vivanuncios", ciudad_target=ciudad)

            # Nombre del anunciante
            for sel in ["span[data-aut-id='seller-name']", ".seller-name", "span.user-name", "div[class*='seller']"]:
                el = await card.query_selector(sel)
                if el:
                    p.nombre = clean_name(await el.inner_text())
                    break

            if not p.nombre:
                # Intentar extraer del texto completo
                full = await card.inner_text()
                lines = [l.strip() for l in full.splitlines() if l.strip()]
                if lines:
                    p.nombre = lines[0][:60]

            # Teléfono visible
            for sel in ["a[href^='tel:']", "span[data-aut-id='phone']", ".phone-number"]:
                el = await card.query_selector(sel)
                if el:
                    raw = await el.get_attribute("href") or await el.inner_text()
                    p.telefono = clean_phone(raw.replace("tel:", ""))
                    break

            # Agencia
            for sel in ["span.agency", "div[class*='agency']", "p.agency-name"]:
                el = await card.query_selector(sel)
                if el:
                    p.agencia = clean_name(await el.inner_text())
                    break

            # Link
            link_el = await card.query_selector("a[href]")
            if link_el:
                href = await link_el.get_attribute("href")
                p.link_perfil = href if href and href.startswith("http") else (self.BASE + href if href else "")

            # Fecha
            for sel in ["span[data-aut-id='date']", "time", ".date", "span.time"]:
                el = await card.query_selector(sel)
                if el:
                    p.ultima_publicacion = (await el.inner_text()).strip()[:30]
                    break

            # Zona
            for sel in ["span[data-aut-id='location']", ".location", "div[class*='location']"]:
                el = await card.query_selector(sel)
                if el:
                    p.zona_dominante = (await el.inner_text()).strip()[:50]
                    break

            full_text = await card.inner_text()
            if not p.zona_dominante:
                p.zona_dominante = extract_zone(full_text, ciudad)

            if ciudad == "El Paso TX":
                p.es_bilingual = is_el_paso_agent(full_text, p.telefono)

            return p

        except Exception:
            return None

    async def _goto_safe(self, url: str) -> bool:
        for attempt in range(MAX_RETRIES):
            try:
                await self.page.goto(url, wait_until="domcontentloaded", timeout=20_000)
                await asyncio.sleep(1.5)
                if await detect_block(self.page):
                    print(f"  ⚠ Bloqueo detectado. Pausa {BLOCK_PAUSE}s...")
                    await asyncio.sleep(BLOCK_PAUSE)
                    continue
                return True
            except PWTimeout:
                print(f"  ⚠ Timeout (intento {attempt+1})")
                await asyncio.sleep(5)
            except Exception as e:
                print(f"  ⚠ Error: {e}")
                await asyncio.sleep(5)
        return False


# ══════════════════════════════════════════════════════════════
# ENRIQUECIMIENTO — CLICK-TO-REVEAL PHONE
# ══════════════════════════════════════════════════════════════

async def try_reveal_phone(page: Page, prospecto: Prospecto) -> str:
    """
    Visita el perfil del agente e intenta hacer click en
    el botón de 'Ver teléfono' para obtener el número real.
    """
    if not prospecto.link_perfil or prospecto.telefono:
        return prospecto.telefono

    try:
        await page.goto(prospecto.link_perfil, wait_until="domcontentloaded", timeout=15_000)
        await asyncio.sleep(2)

        # Selectores del botón de revelar teléfono (varían por sitio)
        reveal_selectors = [
            "button[data-qa='phone-button']",
            "button[class*='phone']",
            "a[class*='phone']",
            "button:has-text('Ver teléfono')",
            "button:has-text('Mostrar teléfono')",
            "button:has-text('Ver número')",
            "a:has-text('Ver teléfono')",
            "span[class*='show-phone']",
        ]

        for sel in reveal_selectors:
            btn = await page.query_selector(sel)
            if btn:
                await btn.click()
                await asyncio.sleep(1.5)

                # Ahora buscar el número revelado
                for phone_sel in ["a[href^='tel:']", "span.phone-revealed", "div[class*='phone-number']"]:
                    el = await page.query_selector(phone_sel)
                    if el:
                        raw = await el.get_attribute("href") or await el.inner_text()
                        phone = clean_phone(raw.replace("tel:", ""))
                        if phone:
                            return phone
                break

    except Exception:
        pass

    return prospecto.telefono


# ══════════════════════════════════════════════════════════════
# DEDUPLICACIÓN
# ══════════════════════════════════════════════════════════════

def deduplicar(prospectos: list[Prospecto]) -> list[Prospecto]:
    """
    Elimina duplicados por nombre+ciudad.
    Si el mismo agente aparece en ambas fuentes, conserva el que tiene teléfono.
    """
    seen: dict[str, Prospecto] = {}

    for p in prospectos:
        key = f"{p.nombre.lower().strip()}|{p.ciudad_target}"
        if key not in seen:
            seen[key] = p
        else:
            existing = seen[key]
            # Preferir el que tiene teléfono o más propiedades
            if (not existing.telefono and p.telefono) or (p.num_propiedades > existing.num_propiedades):
                seen[key] = p

    result = list(seen.values())
    print(f"\n[dedup] {len(prospectos)} → {len(result)} únicos ({len(prospectos) - len(result)} duplicados eliminados)")
    return result


# ══════════════════════════════════════════════════════════════
# CSV OUTPUT
# ══════════════════════════════════════════════════════════════

CSV_FIELDS = [
    "nombre", "telefono", "email", "agencia", "num_propiedades",
    "zona_dominante", "ciudad_target", "fuente", "link_perfil",
    "ultima_publicacion", "es_bilingual", "fecha_scrape",
]


def save_csv(prospectos: list[Prospecto], path: Path, append: bool = False):
    mode = "a" if append else "w"
    write_header = not path.exists() or not append

    with open(path, mode, newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        if write_header:
            writer.writeheader()
        for p in prospectos:
            row = asdict(p)
            row = {k: row[k] for k in CSV_FIELDS}
            writer.writerow(row)

    print(f"\n💾 Guardado: {path} ({len(prospectos)} filas)")


def print_stats(prospectos: list[Prospecto]):
    print("\n" + "═" * 50)
    print("RESUMEN FINAL")
    print("═" * 50)

    by_city: dict[str, list] = {}
    for p in prospectos:
        by_city.setdefault(p.ciudad_target, []).append(p)

    total_con_tel = sum(1 for p in prospectos if p.telefono)
    total_con_agencia = sum(1 for p in prospectos if p.agencia)

    for ciudad, city_prospectos in sorted(by_city.items()):
        con_tel = sum(1 for p in city_prospectos if p.telefono)
        goal = TARGETS[ciudad]["goal"] if ciudad in TARGETS else "?"
        print(f"  {ciudad:<20} {len(city_prospectos):>3}/{goal} | con teléfono: {con_tel}")

    print(f"\n  TOTAL:               {len(prospectos)} prospectos")
    print(f"  Con teléfono:        {total_con_tel} ({round(total_con_tel/len(prospectos)*100)}%)")
    print(f"  Con agencia:         {total_con_agencia}")
    print(f"  Output:              {OUTPUT_CSV}")
    print("═" * 50)


# ══════════════════════════════════════════════════════════════
# ORQUESTADOR PRINCIPAL
# ══════════════════════════════════════════════════════════════

async def scrape_ciudad(playwright, ciudad: str, config: dict, enriched: bool = False) -> list[Prospecto]:
    """Scrape completo para una ciudad, alternando fuentes."""
    goal = config["goal"]
    i24_slug = config["i24_slug"]
    vv_slug = config["vv_slug"]

    print(f"\n{'═'*50}")
    print(f"CIUDAD: {ciudad} | META: {goal} prospectos")
    print(f"{'═'*50}")

    all_prospectos = []

    # ── Inmuebles24 (60% del objetivo) ──
    i24_goal = round(goal * 0.6)
    ctx_i24, browser_i24 = await new_context(playwright)
    page_i24 = await ctx_i24.new_page()
    try:
        scraper_i24 = Inmuebles24Scraper(page_i24)
        i24_results = await scraper_i24.scrape_city(ciudad, i24_slug, i24_goal)
        print(f"  [i24] Obtenidos: {len(i24_results)}")
        all_prospectos.extend(i24_results)
        await human_delay(4, 7)  # pausa entre fuentes
    finally:
        await browser_i24.close()

    # ── Vivanuncios (40% del objetivo) ──
    vv_goal = goal - len(all_prospectos)
    if vv_goal > 0:
        ctx_vv, browser_vv = await new_context(playwright)
        page_vv = await ctx_vv.new_page()
        try:
            scraper_vv = VivanunciosScraper(page_vv)
            vv_results = await scraper_vv.scrape_city(ciudad, vv_slug, vv_goal)
            print(f"  [vv] Obtenidos: {len(vv_results)}")
            all_prospectos.extend(vv_results)
        finally:
            await browser_vv.close()

    # ── Enriquecimiento: click-to-reveal phones (solo si --enrich) ──
    if enriched:
        sin_tel = [p for p in all_prospectos if not p.telefono and p.link_perfil]
        if sin_tel:
            print(f"\n  [enrich] Intentando revelar teléfono para {len(sin_tel)} agentes...")
            ctx_e, browser_e = await new_context(playwright)
            page_e = await ctx_e.new_page()
            try:
                for p in sin_tel[:10]:  # max 10 por ciudad para no exceder tiempo
                    p.telefono = await try_reveal_phone(page_e, p)
                    await human_delay(3, 5)
            finally:
                await browser_e.close()

    # Guardar incrementalmente (no perder datos si se interrumpe)
    deduped = deduplicar(all_prospectos)
    save_csv(deduped, OUTPUT_CSV, append=OUTPUT_CSV.exists())

    return deduped


async def main():
    enrich = "--enrich" in sys.argv

    # Limpiar CSV anterior si se ejecuta fresh
    if "--fresh" in sys.argv and OUTPUT_CSV.exists():
        OUTPUT_CSV.unlink()
        print(f"🗑 CSV anterior eliminado: {OUTPUT_CSV}")

    if OUTPUT_CSV.exists():
        print(f"📋 Appending a CSV existente: {OUTPUT_CSV}")
    else:
        print(f"📋 Creando nuevo CSV: {OUTPUT_CSV}")

    total_inicio = datetime.now()
    todos_los_prospectos = []

    print(f"""
╔══════════════════════════════════════════╗
║  Terra Agents — Prospecting Scraper      ║
║  Meta: 210 prospectos en ~90 minutos     ║
║  Enriquecimiento: {'SÍ' if enrich else 'NO (usa --enrich)'}                   ║
╚══════════════════════════════════════════╝
""")

    async with async_playwright() as playwright:
        # Procesar ciudades en orden de prioridad
        orden = [
            "Ciudad Juárez",   # 50 — prioridad máxima (mercado core)
            "CDMX",            # 40
            "Monterrey",       # 30
            "Chihuahua",       # 30
            "El Paso TX",      # 20 — bilingual
            "Guadalajara",     # 20
            "Tijuana",         # 20
        ]

        for ciudad in orden:
            config = TARGETS[ciudad]
            try:
                city_results = await scrape_ciudad(playwright, ciudad, config, enriched=enrich)
                todos_los_prospectos.extend(city_results)

                elapsed = (datetime.now() - total_inicio).seconds // 60
                print(f"\n⏱ Tiempo transcurrido: {elapsed} min | Total acumulado: {len(todos_los_prospectos)}")

                # Pausa entre ciudades para evitar ban
                pausa = random.uniform(8, 15)
                print(f"💤 Pausa entre ciudades: {pausa:.0f}s")
                await asyncio.sleep(pausa)

            except KeyboardInterrupt:
                print("\n⚠ Interrumpido por usuario. Guardando lo obtenido...")
                break
            except Exception as e:
                print(f"\n❌ Error en {ciudad}: {e}. Continuando con siguiente ciudad...")
                continue

    print_stats(todos_los_prospectos)
    print(f"\n✅ Completado en {(datetime.now() - total_inicio).seconds // 60} minutos.")


if __name__ == "__main__":
    asyncio.run(main())
