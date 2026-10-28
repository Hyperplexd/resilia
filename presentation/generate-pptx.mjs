import { deflateRawSync, crc32 } from 'node:zlib'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const shotDir = join(root, 'screenshots')
const outFile = join(root, 'presentation.pptx')

const SLIDE_W = 12192000
const SLIDE_H = 6858000
const IN = 914400

const BG = '0B0F14'
const TITLE = 'F4F1EA'
const BODY = 'C5CDD4'
const MUTED = '8B969E'
const EMBER = 'FF6A3D'

function emu(inches) {
  return Math.round(inches * IN)
}

function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

function fit(iw, ih, boxW, boxH) {
  const scale = Math.min(boxW / iw, boxH / ih)
  return { w: Math.round(iw * scale), h: Math.round(ih * scale) }
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function textBox({ id, name, x, y, w, h, text, size, color, bold = false }) {
  const lines = Array.isArray(text) ? text : [text]
  const paragraphs = lines
    .map(
      (line) => `<a:p>
        <a:pPr algn="l"/>
        <a:r>
          <a:rPr lang="en-US" sz="${size}" b="${bold ? 1 : 0}" dirty="0">
            <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
            <a:latin typeface="Calibri"/>
            <a:ea typeface="Calibri"/>
            <a:cs typeface="Calibri"/>
          </a:rPr>
          <a:t>${xmlEscape(line)}</a:t>
        </a:r>
      </a:p>`,
    )
    .join('')
  return `<p:sp>
    <p:nvSpPr>
      <p:cNvPr id="${id}" name="${xmlEscape(name)}"/>
      <p:cNvSpPr txBox="1"/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      <a:xfrm>
        <a:off x="${x}" y="${y}"/>
        <a:ext cx="${w}" cy="${h}"/>
      </a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      <a:noFill/>
    </p:spPr>
    <p:txBody>
      <a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="t"/>
      <a:lstStyle/>
      ${paragraphs}
    </p:txBody>
  </p:sp>`
}

function accentBar() {
  return `<p:sp>
    <p:nvSpPr>
      <p:cNvPr id="2" name="Accent"/>
      <p:cNvSpPr/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      <a:xfrm>
        <a:off x="0" y="0"/>
        <a:ext cx="${emu(0.08)}" cy="${SLIDE_H}"/>
      </a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      <a:solidFill><a:srgbClr val="${EMBER}"/></a:solidFill>
    </p:spPr>
  </p:sp>`
}

function picture({ id, name, x, y, w, h, rel }) {
  return `<p:pic>
    <p:nvPicPr>
      <p:cNvPr id="${id}" name="${xmlEscape(name)}"/>
      <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
      <p:nvPr/>
    </p:nvPicPr>
    <p:blipFill>
      <a:blip r:embed="${rel}"/>
      <a:stretch><a:fillRect/></a:stretch>
    </p:blipFill>
    <p:spPr>
      <a:xfrm>
        <a:off x="${x}" y="${y}"/>
        <a:ext cx="${w}" cy="${h}"/>
      </a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    </p:spPr>
  </p:pic>`
}

function slideXml(shapes) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="${BG}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      ${shapes.join('')}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`
}

const slides = [
  {
    kind: 'title',
    kicker: 'RESILIA',
    title: 'What happens if a wildfire starts here?',
    body: [
      'A digital twin of a demo town, Cedar Ridge.',
      'Choose where the fire starts and how bad the day is.',
      'The app plays the next hour. The same settings always produce the same hour.',
    ],
    image: '01-landing.png',
  },
  {
    title: 'The town at the first minute',
    caption: 'Authority view. Ignition on the ridgeline forest edge. Wind NE, high and dry, severity severe. Clearance is 29 min. The fire is still a point.',
    image: '02-ignition.png',
  },
  {
    title: 'Fifteen minutes later',
    caption: 'T+15. 19.3 ha burned, perimeter 1.6 km, about 20 m/min. Roads average 21 km/h, with 3 bottlenecks. Clearance is 25 min. One road is blocked and 468 people are stranded.',
    image: '03-fifteen-minutes.png',
  },
  {
    title: 'The town number hides the split',
    caption: 'Ridgeline still has 468 people and a blocked route, about 75 min. Creekside has 76 left and an open road, about 2 min. Town Center is on warning, with its order at T+16.',
    image: '04-breakdown.png',
  },
  {
    title: 'Send Engine 01 to the fire',
    caption: 'Deployed at T+15 to the active fire front. ETA 17:37, and the route uses a closed road. Playback carried the engine to the front. The captured frame is on scene at T+41.',
    image: '05-engine-deployed.png',
  },
  {
    title: 'Save that hour',
    caption: 'Saved as NE wind, severe, ridgeline forest edge, T+15. The row shows 19.3 ha, 25 min clearance, 42% evacuated, and Engine 01 deployed.',
    image: '06-saved-severe.png',
  },
  {
    title: 'A quieter hour, saved beside it',
    caption: 'Severity set to low. The clock returns to T+00 and the dispatch clears. Saved again at T+15: 4.8 ha, 26 min clearance, 4% evacuated.',
    image: '07-two-saves.png',
  },
  {
    title: 'The same minute, two hours',
    caption: 'A is severe, B is low. The screen says the severe run has 300% more burned area. At T+15: 19.3 ha versus 4.8 ha, clearance 25 min versus 26 min, bottlenecks 3 versus 2, units 1 versus 0.',
    image: '08-compare.png',
  },
  {
    title: 'The person who has to leave',
    caption: 'Resident view. No units and no saved runs. Fire at 220 Ridgeline Drive, T+15. 570 residents are inside the fire, Ridgeline is on alert, and 53% have left.',
    image: '09-resident.png',
  },
  {
    kind: 'close',
    kicker: 'RESILIA',
    title: 'One hour, two questions',
    body: [
      'The resident asks whether the road is still open, and which way leads to a safe place.',
      'The authority asks who leaves, which road fails, and where the engine should go.',
      'Cedar Ridge and this fire are demo data. This is a rehearsal of the hour, not a live forecast.',
    ],
  },
]

const files = new Map()

function add(path, content) {
  files.set(path, Buffer.isBuffer(content) ? content : Buffer.from(content))
}

const slideRels = []
slides.forEach((slide, index) => {
  const n = index + 1
  const shapes = [accentBar()]
  const rels = [
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>`,
  ]
  if (slide.kind === 'title' || slide.kind === 'close') {
    shapes.push(
      textBox({
        id: 3,
        name: 'Kicker',
        x: emu(0.55),
        y: emu(1.35),
        w: emu(slide.image ? 5.6 : 11.8),
        h: emu(0.4),
        text: slide.kicker,
        size: 1600,
        color: EMBER,
        bold: true,
      }),
      textBox({
        id: 4,
        name: 'Title',
        x: emu(0.55),
        y: emu(1.85),
        w: emu(slide.image ? 5.7 : 11.8),
        h: emu(1.8),
        text: slide.title,
        size: 3600,
        color: TITLE,
        bold: true,
      }),
      textBox({
        id: 5,
        name: 'Body',
        x: emu(0.55),
        y: emu(4.0),
        w: emu(slide.image ? 5.6 : 11.2),
        h: emu(2.2),
        text: slide.body,
        size: 1800,
        color: BODY,
      }),
    )
  } else {
    shapes.push(
      textBox({
        id: 3,
        name: 'Title',
        x: emu(0.42),
        y: emu(0.22),
        w: emu(12.4),
        h: emu(0.48),
        text: slide.title,
        size: 2600,
        color: TITLE,
        bold: true,
      }),
      textBox({
        id: 5,
        name: 'Caption',
        x: emu(0.42),
        y: emu(6.72),
        w: emu(12.4),
        h: emu(0.62),
        text: slide.caption,
        size: 1300,
        color: MUTED,
      }),
    )
  }

  if (slide.image) {
    const buf = readFileSync(join(shotDir, slide.image))
    const { w: iw, h: ih } = pngSize(buf)
    const mediaName = `image${n}.png`
    add(`ppt/media/${mediaName}`, buf)
    rels.push(
      `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/>`,
    )
    const box =
      slide.kind === 'title'
        ? { x: emu(6.45), y: emu(0.85), w: emu(6.35), h: emu(5.8) }
        : { x: emu(0.42), y: emu(0.82), w: emu(12.48), h: emu(5.75) }
    const fitted = fit(iw, ih, box.w, box.h)
    const x = box.x + Math.round((box.w - fitted.w) / 2)
    const y = box.y + Math.round((box.h - fitted.h) / 2)
    shapes.push(picture({ id: 6, name: slide.image, x, y, w: fitted.w, h: fitted.h, rel: 'rId2' }))
  }

  add(`ppt/slides/slide${n}.xml`, slideXml(shapes))
  add(
    `ppt/slides/_rels/slide${n}.xml.rels`,
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${rels.join('')}
</Relationships>`,
  )
  slideRels.push(
    `<Relationship Id="rId${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${n}.xml"/>`,
  )
})

const slideIdList = slides
  .map((_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 1}"/>`)
  .join('')

add(
  'ppt/presentation.xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId${slides.length + 1}"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>${slideIdList}</p:sldIdLst>
  <p:sldSz cx="${SLIDE_W}" cy="${SLIDE_H}" type="widescreen"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`,
)

add(
  'ppt/_rels/presentation.xml.rels',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${slideRels.join('')}
  <Relationship Id="rId${slides.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
</Relationships>`,
)

add(
  'ppt/slideMasters/slideMaster1.xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld name="Blank">
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="${BG}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle/>
    <p:bodyStyle/>
    <p:otherStyle/>
  </p:txStyles>
</p:sldMaster>`,
)

add(
  'ppt/slideMasters/_rels/slideMaster1.xml.rels',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`,
)

add(
  'ppt/slideLayouts/slideLayout1.xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`,
)

add(
  'ppt/slideLayouts/_rels/slideLayout1.xml.rels',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`,
)

add(
  'ppt/theme/theme1.xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="RESILIA">
  <a:themeElements>
    <a:clrScheme name="RESILIA">
      <a:dk1><a:srgbClr val="F4F1EA"/></a:dk1>
      <a:lt1><a:srgbClr val="0B0F14"/></a:lt1>
      <a:dk2><a:srgbClr val="C5CDD4"/></a:dk2>
      <a:lt2><a:srgbClr val="1A222B"/></a:lt2>
      <a:accent1><a:srgbClr val="FF6A3D"/></a:accent1>
      <a:accent2><a:srgbClr val="38BDF8"/></a:accent2>
      <a:accent3><a:srgbClr val="E0A83D"/></a:accent3>
      <a:accent4><a:srgbClr val="7D8B96"/></a:accent4>
      <a:accent5><a:srgbClr val="F4F1EA"/></a:accent5>
      <a:accent6><a:srgbClr val="8B969E"/></a:accent6>
      <a:hlink><a:srgbClr val="38BDF8"/></a:hlink>
      <a:folHlink><a:srgbClr val="8B969E"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="RESILIA">
      <a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
      <a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="RESILIA">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`,
)

add(
  '_rels/.rels',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
)

add(
  'docProps/core.xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>RESILIA</dc:title>
  <dc:subject>Cedar Ridge wildfire walkthrough</dc:subject>
  <dc:creator>RESILIA walkthrough</dc:creator>
  <cp:lastModifiedBy>RESILIA walkthrough</cp:lastModifiedBy>
</cp:coreProperties>`,
)

add(
  'docProps/app.xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>RESILIA</Application>
  <Slides>${slides.length}</Slides>
  <PresentationFormat>Widescreen</PresentationFormat>
</Properties>`,
)

const overrides = [...files.keys()]
  .filter((path) => path.endsWith('.xml') && !path.startsWith('docProps/') && path !== '[Content_Types].xml')
  .map((path) => {
    let type = 'application/xml'
    if (path.startsWith('ppt/slides/slide')) type = 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'
    else if (path.includes('slideLayout')) type = 'application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml'
    else if (path.includes('slideMaster')) type = 'application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml'
    else if (path === 'ppt/presentation.xml') type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml'
    else if (path.includes('theme')) type = 'application/vnd.openxmlformats-officedocument.theme+xml'
    else if (path.startsWith('docProps/core')) type = 'application/vnd.openxmlformats-package.core-properties+xml'
    else if (path.startsWith('docProps/app')) type = 'application/vnd.openxmlformats-officedocument.extended-properties+xml'
    return `<Override PartName="/${path}" ContentType="${type}"/>`
  })

add(
  '[Content_Types].xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  ${overrides.join('')}
</Types>`,
)

function zipStore(entries) {
  const parts = []
  const central = []
  let offset = 0
  for (const [name, data] of entries) {
    const nameBuf = Buffer.from(name)
    const compressed = deflateRawSync(data)
    const crc = crc32(data) >>> 0
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0, 6)
    local.writeUInt16LE(8, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(0, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    local.writeUInt16LE(0, 28)
    parts.push(local, nameBuf, compressed)
    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0, 8)
    centralHeader.writeUInt16LE(8, 10)
    centralHeader.writeUInt16LE(0, 12)
    centralHeader.writeUInt16LE(0, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(compressed.length, 20)
    centralHeader.writeUInt32LE(data.length, 24)
    centralHeader.writeUInt16LE(nameBuf.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE(0, 38)
    centralHeader.writeUInt32LE(offset, 42)
    central.push(centralHeader, nameBuf)
    offset += local.length + nameBuf.length + compressed.length
  }
  const centralBuf = Buffer.concat(central)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(entries.length, 8)
  eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(centralBuf.length, 12)
  eocd.writeUInt32LE(offset, 16)
  eocd.writeUInt16LE(0, 20)
  return Buffer.concat([...parts, centralBuf, eocd])
}

mkdirSync(root, { recursive: true })
const ordered = [...files.entries()].sort((a, b) => a[0].localeCompare(b[0]))
writeFileSync(outFile, zipStore(ordered))
console.log(`Wrote ${outFile} (${slides.length} slides, ${ordered.length} parts)`)
