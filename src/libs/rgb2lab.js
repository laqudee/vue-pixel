// 将rgb转换为lab
// 将图像从RGB颜色空间转换到CIE-Lab颜色空间
export default function rgb2lab(sR, sG, sB) {
  //rgb2xyz
  let R = sR / 255
  let G = sG / 255
  let B = sB / 255

  let r, g, b
  if (R <= 0.04045) r = R / 12.92
  else r = Math.pow((R + 0.055) / 1.055, 2.4)
  if (G <= 0.04045) g = G / 12.92
  else g = Math.pow((G + 0.055) / 1.055, 2.4)
  if (B <= 0.04045) b = B / 12.92
  else b = Math.pow((B + 0.055) / 1.055, 2.4)

  let X, Y, Z
  X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
  Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
  Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041

  //xyz2lab
  let epsilon = 0.008856 //actual CIE standard
  let kappa = 903.3 //actual CIE standard

  let Xr = 0.950456 //reference white
  let Yr = 1.0 //reference white
  let Zr = 1.088754 //reference white
  let xr = X / Xr
  let yr = Y / Yr
  let zr = Z / Zr

  let fx, fy, fz
  if (xr > epsilon) fx = Math.pow(xr, 1.0 / 3.0)
  else fx = (kappa * xr + 16.0) / 116.0
  if (yr > epsilon) fy = Math.pow(yr, 1.0 / 3.0)
  else fy = (kappa * yr + 16.0) / 116.0
  if (zr > epsilon) fz = Math.pow(zr, 1.0 / 3.0)
  else fz = (kappa * zr + 16.0) / 116.0

  let lval = 116.0 * fy - 16.0
  let aval = 500.0 * (fx - fy)
  let bval = 200.0 * (fy - fz)

  return {
    l: lval,
    a: aval,
    b: bval
  }
}