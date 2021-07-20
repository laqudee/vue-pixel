export default class padText {
  constructor(filedom, config, canvas, filetype, filename) {
    this['Upload Image'] = function () {
      console.log("upload image")
      filedom.click()
    }
    this.blockSize = config.blockSize
    this.weight = config.weight
    this.iters = config.iters
    this.stride = config.stride
    this.grid = config.withGrid
    this.Centers = config.withCenters
    this.Contours = config.withContours
    this['Export image'] = function () {
      var MIME_TYPE = filetype
      var imgURL = canvas.toDataURL(filetype)
      var link = document.createElement('a')
      link.download = filename
      link.href = imgURL
      link.dataset.downloadurl = [MIME_TYPE, link.download, link.href].join(':')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}