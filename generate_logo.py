import math

# Perfect 60-degree isometric grid calculation
# Tan(60) = sqrt(3), Cos(60) = 0.5, Sin(60) = sqrt(3)/2 = 0.8660254
SQRT3 = math.sqrt(3)

# Let triangle top be Y = 80
# Top-left = (120, 80)
# Top-right = (480, 80)  (Width = 360)
# Height = 360 * SQRT3 / 2 = 311.77
# Bottom apex = (300, 80 + 311.77) = (300, 391.77)

# Outer Left line: y - 80 = SQRT3 * (x - 120)  => x(y) = 120 + (y - 80) / SQRT3
# Outer Right line: y - 80 = -SQRT3 * (x - 480) => x(y) = 480 - (y - 80) / SQRT3

# Stroke thickness perpendicular = T = 32
# Horizontal thickness along X = T / sin(60) = 32 / (SQRT3/2) = 64 / SQRT3 ~= 36.95
# Vertical thickness along Y = T / cos(60) = 64

# Let's inspect the exact paths in the reference:
# 1. Left loop:
# - Outer edge from (120, 80) down to (275, 348)
# - Inner cutout triangle: top at y=135, left at outer_left + H_thick, right at inner_slant
# 2. Right chevron:
# - Starts at top right (480, 80)
# - Outer edge down to (298, 388)
# - Angled cut at bottom tip
# - Inner edge goes up parallel to right edge
# - Turns up parallel to left edge to top line

# Let's write an ultra-clean, exact SVG with these clean vectors:
svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" fill="none">
  <defs>
    <linearGradient id="vyroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="85%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FF6B2C" />
    </linearGradient>
    <filter id="vyroGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#FF6B2C" flood-opacity="0.5"/>
    </filter>
  </defs>
  <g filter="url(#vyroGlow)">
    <!-- Main VYRO geometric glyph matching reference precisely -->
    <!-- Left outer hook and inner triangle -->
    <path d="M 140 100 
             L 245 100 
             L 210 160 
             L 175 160 
             L 255 300 
             L 225 350 
             L 140 200 
             L 140 100 Z 
             M 175 128 
             L 218 128 
             L 196 166 Z" 
          fill="url(#vyroGradient)" fill-rule="evenodd" />

    <!-- Center/Right V-Y interconnected arm -->
    <path d="M 270 100 
             L 345 100 
             L 295 186 
             L 370 186 
             L 460 100 
             L 460 100 
             L 298 380 
             L 270 380 
             L 282 360 
             L 415 130 
             L 370 130 
             L 295 260 
             L 235 156 
             L 270 100 Z" 
          fill="url(#vyroGradient)" opacity="0" />

    <!-- Pure geometric clean rendition matching reference image -->
    <!-- Outer Triangle Frame with custom negative space cutouts -->
    <path d="M 136 100 L 254 100 L 210 176 L 180 176 L 244 286 L 268 286 L 298 338 L 285 360 L 270 360 L 222 277 L 136 128 Z
             M 172 126 L 224 126 L 198 171 Z"
          fill="url(#vyroGradient)" fill-rule="evenodd" />

    <path d="M 334 100 L 464 100 L 298 388 L 286 368 L 418 140 L 370 140 L 298 264 L 260 198 L 284 156 L 308 198 L 364 100 Z"
          fill="url(#vyroGradient)" />
  </g>
</svg>
"""

with open('assets/images/vyro-logo.svg', 'w') as f:
    f.write(svg_content)

print("Updated vyro-logo.svg")
