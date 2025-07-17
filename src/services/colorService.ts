/**
 * Service pour la gestion des couleurs de satisfaction
 */

/**
 * Retourne une couleur interpolée entre le rouge et le vert selon le degré de satisfaction
 * @param degree - Degré de satisfaction entre 0 et 1
 * @returns Couleur RGB correspondante
 */
export function getGradientColor(degree: number): string {
  const red = { r: 255, g: 0, b: 0 };
  const dark_yellow = { r: 215, g: 215, b: 0 };
  const dark_green = { r: 0, g: 179, b: 0 };

  // Normaliser le degré entre 0 et 1
  degree = Math.max(0, Math.min(1, degree));

  if (degree > 0.5) {
    // Interpolation entre jaune et vert (0.5 à 1)
    return interpolateBetweenColors(dark_green, dark_yellow, 200 * (degree - 0.5));
  } else {
    // Interpolation entre rouge et jaune (0 à 0.5)
    return interpolateBetweenColors(dark_yellow, red, 200 * degree);
  }
}

/**
 * Interpole entre deux couleurs
 * @param fromColor - Couleur de départ
 * @param toColor - Couleur d'arrivée
 * @param percent - Pourcentage d'interpolation
 * @returns Couleur interpolée
 */
function interpolateBetweenColors(
  fromColor: { r: number; g: number; b: number },
  toColor: { r: number; g: number; b: number },
  percent: number,
): string {
  const delta = percent / 100;
  const r = Math.round(toColor.r + (fromColor.r - toColor.r) * delta);
  const g = Math.round(toColor.g + (fromColor.g - toColor.g) * delta);
  const b = Math.round(toColor.b + (fromColor.b - toColor.b) * delta);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Génère une palette de couleurs pour l'échelle de satisfaction
 * @param steps - Nombre d'étapes dans la palette
 * @returns Array de couleurs RGB
 */
export function generateColorPalette(steps: number = 10): string[] {
  const colors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const degree = i / (steps - 1);
    colors.push(getGradientColor(degree));
  }

  return colors;
}
