"""
Exports the Punkkyber city for the web: public/hero/city.glb, plus the city's own camera poses.

The city's materials are procedural, which glTF cannot carry. Each material is replaced by a plain one
the browser can draw: glowing materials keep their emission colour, facades keep their name (the site
draws their windows with a small shader), everything else becomes a dark surface of its base colour.

  blender -b assets/models/city/punkkyber-source.blend --python scripts/blender/city-export.py -- public/hero/city.glb
"""
import bmesh
import bpy
import sys
from mathutils import Vector

CAMERA = "CAM_02_POV_NorthAvenue"
# The box kept, in the camera's space (metres): forward depth, half width, height above the camera.
DEPTH, HALF_WIDTH, HEIGHT, BELOW = 100.0, 35.0, 60.0, 3.0
SKIP_COLLECTIONS = {"Fog", "Lights", "Cameras"}
# Fine detail nobody can see from the sky: window frames, AC units, small trim (116k of 277k triangles).
SKIP_OBJECTS = {"WinFrames_Near", "Decor_MetalDark", "Decor_ACUnit", "Decor_LedgeConcrete"}
# The whole city, not one avenue.
WHOLE_CITY = True
# The city's cameras the site flies between, written beside the model.
CAMERAS = ["CAM_01_POV_Hero", "CAM_02_POV_NorthAvenue", "CAM_05_EastStreet", "CAM_07_WestStreet", "CAM_06_Aerial", "CAM_09_Sky_Dive", "CAM_10_Sky_Overhead", "CAM_12_Sky_Megatower"]


def emission_of(mat):
    """Colour and strength of the material's glow, or None if it does not glow."""
    if not mat or not mat.use_nodes:
        return None
    for n in mat.node_tree.nodes:
        if n.type == "EMISSION" and n.inputs["Strength"].default_value > 0:
            return tuple(n.inputs["Color"].default_value[:3]), n.inputs["Strength"].default_value
        if n.type == "BSDF_PRINCIPLED":
            s = n.inputs["Emission Strength"].default_value
            if s > 0 and not n.inputs["Emission Color"].is_linked:
                return tuple(n.inputs["Emission Color"].default_value[:3]), s
    return None


def base_of(mat):
    if mat and mat.use_nodes:
        for n in mat.node_tree.nodes:
            if n.type == "BSDF_PRINCIPLED" and not n.inputs["Base Color"].is_linked:
                return tuple(n.inputs["Base Color"].default_value[:3])
    return (0.04, 0.045, 0.06)


def web_material(mat):
    """A plain stand-in, named web_<original> so the site can recognise facades and glows."""
    name = f"web_{mat.name if mat else 'none'}"
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    out = bpy.data.materials.new(name)
    out.use_nodes = True
    bsdf = next(n for n in out.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    glow = emission_of(mat)
    if glow:
        colour, strength = glow
        bsdf.inputs["Base Color"].default_value = (*colour, 1)
        bsdf.inputs["Emission Color"].default_value = (*colour, 1)
        bsdf.inputs["Emission Strength"].default_value = min(strength, 8.0)
    elif mat and mat.name.startswith("Facade"):
        # A colour of their own, so the optimiser keeps facades apart and the site can draw their windows.
        bsdf.inputs["Base Color"].default_value = (0.031, 0.033, 0.047, 1)
    elif mat and mat.name.startswith("Asphalt"):
        bsdf.inputs["Base Color"].default_value = (0.018, 0.019, 0.026, 1)
        bsdf.inputs["Roughness"].default_value = 0.22
        return out
    else:
        bsdf.inputs["Base Color"].default_value = (*base_of(mat), 1)
    bsdf.inputs["Roughness"].default_value = 0.6
    return out


def main():
    out_path = sys.argv[sys.argv.index("--") + 1]
    cam = bpy.data.objects[CAMERA]
    inv = cam.matrix_world.inverted()
    deps = bpy.context.evaluated_depsgraph_get()

    def inside(p):
        if WHOLE_CITY:
            return True
        c = inv @ p
        return -DEPTH <= c.z <= 2 and abs(c.x) <= HALF_WIDTH and -BELOW <= c.y <= HEIGHT

    export = bpy.data.collections.new("WebCity")
    bpy.context.scene.collection.children.link(export)
    kept = 0
    for o in list(bpy.data.objects):
        if o.type not in ("MESH", "FONT") or o.hide_render:
            continue
        if any(c.name in SKIP_COLLECTIONS for c in o.users_collection) or o.name in SKIP_OBJECTS:
            continue
        me = bpy.data.meshes.new_from_object(o.evaluated_get(deps))
        me.transform(o.matrix_world)
        bm = bmesh.new()
        bm.from_mesh(me)
        gone = [f for f in bm.faces if not inside(f.calc_center_median())]
        bmesh.ops.delete(bm, geom=gone, context="FACES")
        if not bm.faces:
            bm.free()
            bpy.data.meshes.remove(me)
            continue
        bm.to_mesh(me)
        bm.free()
        for i, slot in enumerate(o.material_slots):
            if i < len(me.materials):
                me.materials[i] = web_material(slot.material)
        if not o.material_slots:
            me.materials.append(web_material(None))
        piece = bpy.data.objects.new(f"web_{o.name}", me)
        export.objects.link(piece)
        kept += 1

    # Recentre on the camera's feet so the web scene works in small numbers; record the camera too.
    origin = cam.matrix_world.translation.copy()
    origin.z = 0
    for o in export.objects:
        o.data.transform(__import__("mathutils").Matrix.Translation(-origin))
    # Camera poses in the web's frame: glTF is Y-up, so Blender (x, y, z) becomes (x, z, -y).
    import json
    from mathutils import Vector

    def web(v):
        return [round(v.x, 3), round(v.z, 3), round(-v.y, 3)]

    poses = {}
    for name in CAMERAS:
        c = bpy.data.objects[name]
        eye = c.matrix_world.translation - origin
        ahead = c.matrix_world.to_3x3() @ Vector((0, 0, -1))
        poses[name] = {"eye": web(eye), "target": web(eye + ahead * 20), "fov": round(__import__("math").degrees(c.data.angle_y), 1)}
    with open(out_path.replace(".glb", "-cameras.json"), "w") as f:
        json.dump(poses, f, indent=1)

    bpy.ops.object.select_all(action="DESELECT")
    for o in export.objects:
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=out_path, export_format="GLB", use_selection=True, export_yup=True, export_apply=True,
        export_texcoords=False, export_normals=True, export_cameras=False, export_lights=False,
        export_extras=False,
    )
    tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in export.objects if o.type == "MESH")
    print(f"CITY {kept} objects, {tris} triangles, {len([m for m in bpy.data.materials if m.name.startswith('web_')])} materials -> {out_path}")


main()
