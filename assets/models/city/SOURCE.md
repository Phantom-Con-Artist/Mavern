# Punkkyber city

- Source: the owner's own Blender scene (`~/blender-scenes/Punkkyber.blend`), copied here unchanged as `punkkyber-source.blend`.
- `scripts/blender/city-export.py` exports it for the web: `public/hero/city.glb` (whole city without the finest decor; materials replaced by plain web stand-ins that keep the glow colours) and `src/components/hero/city-cameras.json` (the scene's own cameras, used as the hero's viewpoints).
- Render the source with its own look: run the embedded `cyber_look_switch.py` text first, and point `OCIO` at `~/blender-scenes/render-compatible.ocio` on this machine.
