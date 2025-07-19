/**
 * Service for satisfaction color management
 */

/**
 * Returns an interpolated color between red and green based on satisfaction degree
 * @param {number} degree - Satisfaction degree between 0 and 1
 * @returns {string} Corresponding RGB color in format 'rgb(r,g,b)'
 */
export function getGradientColor(degree: number): string {
  const red = { r: 255, g: 0, b: 0 };
  const dark_yellow = { r: 215, g: 215, b: 0 };
  const dark_green = { r: 0, g: 179, b: 0 };

  // Normalize the degree between 0 and 1
  degree = Math.max(0, Math.min(1, degree));

  if (degree > 0.5) {
    // Interpolation between yellow and green (0.5 to 1)
    return interpolateBetweenColors(dark_green, dark_yellow, 200 * (degree - 0.5));
  } else {
    // Interpolation between red and yellow (0 à 0.5)
    return interpolateBetweenColors(dark_yellow, red, 200 * degree);
  }
}

/**
 * Interpolates between two colors
 * @param {Object<string, number>} fromColor - Starting color in format { r: number, g: number, b: number }
 * @param {Object<string, number>} toColor - Ending color in format { r: number, g: number, b: number }
 * @param {number} percent - Interpolation percentage
 * @returns {string} Interpolated color in format 'rgb(r,g,b)'
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
