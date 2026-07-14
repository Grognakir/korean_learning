import type { Skin, SkinId } from "@/lib/scene/skin";
import { cc0Skin } from "@/lib/scene/skins/cc0";
import { cozySkin } from "@/lib/scene/skins/cozy";
import { lpcSkin } from "@/lib/scene/skins/lpc";

export const pixelSkins: Record<Exclude<SkinId, "svg">, Skin> = {
  cc0: cc0Skin,
  cozy: cozySkin,
  lpc: lpcSkin,
};

export function getPixelSkin(id: Exclude<SkinId, "svg">): Skin {
  return pixelSkins[id];
}

export { cc0Skin, cozySkin, lpcSkin };
