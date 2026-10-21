type Size = { w: number; h: number };

/**
 * Where a point of an image lands on screen when the image fills a box with object-fit: cover.
 * `position` is the CSS object-position as fractions; `point` is the point as fractions of the image.
 */
export function coverPoint(box: Size, image: Size, position: [number, number], point: [number, number]): { x: number; y: number } {
  const scale = Math.max(box.w / image.w, box.h / image.h);
  const left = -(image.w * scale - box.w) * position[0];
  const top = -(image.h * scale - box.h) * position[1];
  return { x: left + point[0] * image.w * scale, y: top + point[1] * image.h * scale };
}
