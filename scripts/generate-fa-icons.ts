/**
 * Turns the Font Awesome packages into a local icon collection.
 *
 * Nuxt UI addresses icons by name (`i-fa-plus`), including the ones its own components use
 * internally for ticks, chevrons and spinners. Writing the icons out as SVG files lets a
 * single collection cover both our iconography and theirs, so nothing falls back to another
 * icon set.
 *
 * The iconography is Font Awesome Pro. The Pro packages need a licence token to install
 * (.npmrc, .env.example), so they are optional dependencies: where they are missing — a
 * fork, a machine without the token — every icon is drawn from Font Awesome Free instead,
 * so the site still builds. Free comes from Iconify's copy of it, because the whole
 * @fortawesome scope is routed to the registry that wants the token. The output is never
 * committed (.gitignore).
 *
 * Runs on install, and by hand with `bun run icons:generate` after changing the list below.
 */

import { mkdir, rm, writeFile } from 'node:fs/promises'

type ProStyle = 'light' | 'solid'

interface IconSource {
  /** Which Pro style draws it. */
  readonly style: ProStyle
  /** The Font Awesome Pro export. */
  readonly pro: string
  /** The Font Awesome Free (solid) icon used without a Pro licence. */
  readonly free: string
}

/** A Font Awesome package's icon: [width, height, ligatures, unicode, path(s)]. */
type ProIcon = readonly [number, number, readonly string[], string, string | readonly string[]]

interface ProDefinition {
  readonly icon: ProIcon
}

/** The shape of an Iconify icon set (icons.json). */
interface IconifySet {
  readonly width?: number
  readonly height?: number
  readonly icons: Readonly<Record<string, { body: string; width?: number; height?: number }>>
}

const OUT_DIR = 'app/assets/icons/fa'
const FREE_DEFAULT_SIZE = 512

/** `faArrowLeft` -> `arrow-left`, the name Font Awesome Free has it under. */
const kebab = (exportName: string): string =>
  exportName
    .replace(/^fa/, '')
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase()

const light = (pro: string, free: string = kebab(pro)): IconSource => ({
  style: 'light',
  pro,
  free,
})

const solid = (pro: string, free: string = kebab(pro)): IconSource => ({
  style: 'solid',
  pro,
  free,
})

/** Icon name in the collection -> where it comes from. */
const ICONS: Readonly<Record<string, IconSource>> = {
  // Nuxt UI's own (app.config.ts).
  'arrow-left': solid('faArrowLeft'),
  'arrow-right': solid('faArrowRight'),
  check: solid('faCheck'),
  'angles-left': solid('faAnglesLeft'),
  'angles-right': solid('faAnglesRight'),
  'chevron-down': solid('faChevronDown'),
  'chevron-left': solid('faChevronLeft'),
  'chevron-right': solid('faChevronRight'),
  'chevron-up': solid('faChevronUp'),
  xmark: solid('faXmark'),
  ellipsis: solid('faEllipsis'),
  'arrow-up-right-from-square': solid('faArrowUpRightFromSquare'),
  folder: solid('faFolder'),
  'folder-open': solid('faFolderOpen'),
  'spinner-third': solid('faSpinnerThird', 'spinner'),
  minus: solid('faMinus'),
  plus: solid('faPlus'),
  'magnifying-glass': solid('faMagnifyingGlass'),
  'arrow-up-from-bracket': solid('faArrowUpFromBracket'),

  // The two themes.
  alien: light('faAlien8bit', 'skull'),
  'planet-ringed': light('faPlanetRinged', 'globe'),

  // The returning backer's gift.
  robot: light('faRobot'),

  // The games.
  legacy: light('faDna'),
  og: light('faStarship', 'rocket'),
  lockdown: light('faLockKeyhole', 'lock'),
  retaliation: light('faRaygun', 'person-rifle'),
  edition: light('faChessKnight'),
  finish: light('faBrush', 'paintbrush'),

  // The extras, one per switch.
  gameplay: light('faPuzzlePiece'),
  acrylic: light('faGem'),
  playmat: light('faMap'),
  artbook: light('faBookOpen'),
  synthetic: light('faCards', 'clone'),
  sleeves: light('faLayerGroup'),
  terrain: light('faCubes'),
  untold: light('faBookSkull'),
  promo: light('faStar'),
  bigbox: light('faBoxOpenFull', 'box-open'),
  sculpts: light('faChessQueen'),
  cats: light('faCatSpace', 'cat'),
  hoodie: light('faShirtLongSleeve', 'shirt'),
  dicetray: light('faDiceD20'),
  plush: light('faTeddyBear', 'paw'),

  // Delivery, tax and money.
  shipping: light('faTruckFast'),
  split: light('faSplit', 'code-branch'),
  single: light('faBoxTaped', 'box'),
  tax: light('faReceipt'),
  destination: light('faEarthEurope'),
  currency: light('faCoins'),
  cart: light('faCartShopping'),
  value: light('faGift'),
  savings: light('faPiggyBank'),
  bonus: light('faSparkles', 'wand-magic-sparkles'),

  // Signs and actions.
  'circle-info': light('faCircleInfo'),
  'circle-check': solid('faCircleCheck'),
  'triangle-exclamation': light('faTriangleExclamation'),
  'arrow-rotate-left': light('faArrowRotateLeft'),
  link: light('faLink'),
  clock: light('faClock'),
  sliders: light('faSliders'),
  list: light('faListCheck'),
}

type Package = Readonly<Record<string, unknown>>

const isRecord = (value: unknown): value is Package => typeof value === 'object' && value !== null

const isProDefinition = (value: unknown): value is ProDefinition =>
  isRecord(value) && Array.isArray(value['icon'])

const isIconifySet = (value: unknown): value is IconifySet =>
  isRecord(value) && isRecord(value['icons'])

/** Loads a package that may not be installed; the specifier is a variable so it stays optional. */
const load = async (name: string): Promise<Package | null> => {
  try {
    const loaded: unknown = await import(name)
    return isRecord(loaded) ? loaded : null
  } catch {
    return null
  }
}

const svg = (width: number, height: number, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(width)} ${String(height)}">${body}</svg>`

const fromPro = (definition: ProDefinition): string => {
  const [width, height, , , path] = definition.icon
  const paths = typeof path === 'string' ? [path] : path
  return svg(width, height, paths.map((d) => `<path fill="currentColor" d="${d}"/>`).join(''))
}

const proPackages: Readonly<Record<ProStyle, Package | null>> = {
  light: await load('@fortawesome/pro-light-svg-icons'),
  solid: await load('@fortawesome/pro-solid-svg-icons'),
}
const hasPro = proPackages.light !== null && proPackages.solid !== null

const FREE_ICONS = 'node_modules/@iconify-json/fa7-solid/icons.json'
const free: unknown = await Bun.file(FREE_ICONS).json()
if (!isIconifySet(free)) {
  throw new Error(`${FREE_ICONS} is not an Iconify icon set`)
}

/** Pro icons this list names that the installed Pro packages do not have. */
const notInPro: string[] = []

const draw = (source: IconSource): string | null => {
  const pro = proPackages[source.style]?.[source.pro]
  if (hasPro && isProDefinition(pro)) {
    return fromPro(pro)
  }
  if (hasPro) {
    notInPro.push(source.pro)
  }
  const icon = free.icons[source.free]
  if (icon === undefined) {
    return null
  }
  return svg(
    icon.width ?? free.width ?? FREE_DEFAULT_SIZE,
    icon.height ?? free.height ?? FREE_DEFAULT_SIZE,
    icon.body,
  )
}

await rm(OUT_DIR, { recursive: true, force: true })
await mkdir(OUT_DIR, { recursive: true })

const missing: string[] = []
for (const [name, source] of Object.entries(ICONS)) {
  const drawn = draw(source)
  if (drawn === null) {
    missing.push(name)
    continue
  }
  await writeFile(`${OUT_DIR}/${name}.svg`, drawn, 'utf8')
}

const written = Object.keys(ICONS).length - missing.length
const family = hasPro
  ? 'Font Awesome Pro'
  : 'Font Awesome Free (the Pro packages are not installed; see .env.example)'
console.log(`wrote ${String(written)} icons to ${OUT_DIR} from ${family}`)

// A misspelt Pro name would otherwise pass unnoticed behind its Free stand-in.
if (notInPro.length > 0) {
  console.error(`not in Font Awesome Pro, drawn from Free instead: ${notInPro.join(', ')}`)
  process.exitCode = 1
}

if (missing.length > 0) {
  console.error(`no icon found for: ${missing.join(', ')}`)
  process.exitCode = 1
}
