// 找到梯度最小的值
// 优化初始聚类中心。在聚类中心的3*3邻域内选择梯度最小的像素点作为新的聚类中心

export default function findLocalMinimum(hpos, wpos, width, height, imageArray) {
  let min_grad = Number.MAX_VALUE
  let loc_min = {}

  for (let i = hpos - 1; i <= hpos + 1 && i >= 0 && i < height - 1; i++) {
    for (let j = wpos - 1; j <= wpos + 1 && j >= 0 && j < width - 1; j++) {
      let i1 = imageArray[4 * (i * width + j + 1)] //right pixel
      let i2 = imageArray[4 * ((i + 1) * width + j + 1)] // bottom pixel
      let i3 = imageArray[4 * (i * width + j)] // self
      if (Math.sqrt(Math.pow(i1 - i3, 2)) + Math.sqrt(Math.pow(i2 - i3, 2)) < min_grad) {
        min_grad = Math.abs(i1 - i3) + Math.abs(i2 - i3)
        loc_min.x = i
        loc_min.y = j
      }
    }
  }
  return loc_min
}