// 计算最终度量距离
export default function computeDist(centerPos, pixX, pixY, centers, imageArray, width, weight, step) {

  let center = centers[centerPos]

  // 颜色距离
  let dc = Math.sqrt(Math.pow(center.l - imageArray[4 * (pixX * width + pixY)], 2) +
    Math.pow(center.a - imageArray[4 * (pixX * width + pixY) + 1], 2) +
    Math.pow(center.b - imageArray[4 * (pixX * width + pixY) + 2], 2))

  // 空间距离
  let ds = Math.sqrt(Math.pow(center.x - pixX, 2) + Math.pow(center.y - pixY, 2))

  return Math.pow(dc / weight, 2) + Math.pow(ds / step, 2)
}