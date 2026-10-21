/** Where the visitor's choice is kept between visits. */
export const SOUND_KEY = "mavern-sound";

/** The music plays unless the visitor has turned it off. */
export function soundWanted(stored: string | null): boolean {
  return stored !== "off";
}
