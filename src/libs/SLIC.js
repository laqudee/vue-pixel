import rgb2lab from './rgb2lab.js'
import findLocalMinimum from './findLocalMinimum.js'
import computeDist from './computeDist.js'

export default class SLIC {
    constructor(imageArray, width, height) {
        // Uint8ClampedArray：8位无符号整型固定数组
        // 从一个类数组或可枚举对象创建一个新的 Uint8ClampedArray
        this.rgbImage = Uint8ClampedArray.from(imageArray)
        this.imageArray = Array.from(imageArray)
        this.width = width
        this.height = height
        console.log("SLIC-Total pixel :", this.width * this.height)
        console.log("SLIC-width :", width)
        console.log("SLIC-height: ", height)
    }


    // 显示聚类中心点
    showCenters(ctx) {

        // let canvas = document.getElementById("canvas")
        // let ctx = canvas.getContext("2d")
        //ctx.fillStyle = "#FF0000"
        /**
         * 好神奇的取颜色方法
         */
        ctx.fillStyle = "#" + ("00000" + ((Math.random() * 16777215 + 0.5) >> 0).toString(16)).slice(-6)
        for (let i = 0; i < this.centers.length; i++) {
            //console.log(this.centers[i].x + "  " + this.centers[i].y)
            ctx.fillRect(this.centers[i].y, this.centers[i].x, 5, 5)
        }
    }

    // 显示聚类边界
    showContours(ctx) {
        // 像素的8邻表示法
        let dx8 = [-1, -1, 0, 1, 1, 1, 0, -1]
        let dy8 = [0, -1, -1, -1, 0, 1, 1, 1]

        let contours = []
        let istaken = Array.from({
            length: this.height
        }).map(linearray =>
            linearray = Array.from({
                length: this.width
            }).map(item => item = false))
        /**
         * istakne是一个二维数组[700 * 700]
         */

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let nr_p = 0

                /* Compare the pixel to its 8 neighbours. */
                for (let k = 0; k < 8; k++) {
                    let x = i + dx8[k],
                        y = j + dy8[k]

                    if (x >= 0 && x < this.height && y >= 0 && y < this.width) {
                        if (istaken[x][y] == false && this.clusterID[i * this.width + j] != this.clusterID[x * this.width + y]) {
                            nr_p += 1
                        }
                    }
                }

                /* Add the pixel to the contour list if desired. */
                if (nr_p >= 2) {
                    contours.push({
                        x: i,
                        y: j
                    })
                    istaken[i][j] = true
                }
            }
        }
        for (let i = 0; i < contours.length; i++) {
            // let ctx = this.canvas.getContext("2d")
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(contours[i].y, contours[i].x, 2, 2)
        }
    }

    // 在常规网格步长采样像素，初始化聚类中心
    computePixel() {
        console.log("computing.............................")
        //Initialize cluster centers by sampling pixels at regualr grid step 
        // 标记表
        this.clusterID = Array.from({
            length: this.width * this.height
        }).map(item => item = -1)
        this.centers = new Array()

        // 先找到聚类中心
        for (let i = this.step; i < this.height; i += this.step) {
            for (let j = this.step; j < this.width; j += this.step) {
                let center = findLocalMinimum(i, j, this.width, this.height, this.imageArray)
                center.l = (this.imageArray)[4 * (center.x * this.width + center.y)]
                center.a = (this.imageArray)[4 * (center.x * this.width + center.y) + 1]
                center.b = (this.imageArray)[4 * (center.x * this.width + center.y) + 2]
                this.centers.push(center)
            }
        }

        //Interations
        for (let i = 0; i < this.iters; i++) {
            // minimum distance to centers 
            let distances = Array.from({
                length: this.width * this.height
            }).map(item => item = Number.MAX_VALUE)

            for (let j = 0; j < this.centers.length; j++) {
                for (let m = this.centers[j].x - this.step; m < this.centers[j].x + this.step; m++) {
                    for (let n = this.centers[j].y - this.step; n < this.centers[j].y + this.step; n++) {
                        if (m >= 0 && m < this.height && n >= 0 && n < this.width) {
                            //console.log(this.centers[j].x, this.centers[j].y, intStep)
                            // 计算做终的度量距离
                            let d = computeDist(j, m, n, this.centers, this.imageArray, this.width, this.weight, this.step)
                            if (d < distances[m * this.width + n]) {
                                distances[m * this.width + n] = d
                                this.clusterID[m * this.width + n] = j
                            }
                        }
                    }
                }
            }


            let oldcenters = JSON.parse(JSON.stringify(this.centers))
            //clear old value
            for (var ele of this.centers) {
                ele.c = ele.l = ele.a = ele.b = ele.x = ele.y = 0
            }

            //compute new cluster centers

            for (let j = 0; j < this.height; j++)
                for (let k = 0; k < this.width; k++) {
                    let c = this.clusterID[j * this.width + k]
                    if (c != -1) {
                        this.centers[c].l += this.imageArray[4 * (j * this.width + k)]
                        this.centers[c].a += this.imageArray[4 * (j * this.width + k) + 1]
                        this.centers[c].b += this.imageArray[4 * (j * this.width + k) + 2]
                        this.centers[c].x += j
                        this.centers[c].y += k
                        this.centers[c].c += 1
                    }
                }

            for (var index in this.centers) {
                if (this.centers[index].c == 0 || this.centers[index].x == undefined || this.centers[index].y == undefined) {
                    // this.centers[index]= JSON.parse(JSON.stringify(oldcenters[index]))
                    //    console.log("--")
                    // console.log(index,this.centers[index].c,this.centers[index].x,this.centers[index].y)
                    this.centers[index] = JSON.parse(JSON.stringify(oldcenters[index]))
                    // console.log(index,this.centers[index].c,this.centers[index].x,this.centers[index].y)

                    let canvas = document.getElementById("canvas")
                    let context = canvas.getContext("2d")
                    context.fillRect(this.centers[index].y, this.centers[index].x, 10, 10)
                } else {
                    this.centers[index].l /= this.centers[index].c
                    this.centers[index].a /= this.centers[index].c
                    this.centers[index].b /= this.centers[index].c
                    this.centers[index].x = Math.floor(this.centers[index].x / this.centers[index].c)
                    this.centers[index].y = Math.floor(this.centers[index].y / this.centers[index].c)
                }
            }
        }
        console.log("compute done.............................")
    }

    pickPixel() {
        console.log("paiting...................")
        // pick pixel 
        let row = Math.ceil(this.height / this.stride)
        let col = Math.ceil(this.width / this.stride)
        let resultImage = new Uint8ClampedArray(this.width * this.height * 4)

        // iteration for every pix rectangle
        for (let m = 0; m < row; m++) {
            for (let n = 0; n < col; n++) {

                let startj = m * this.stride
                let startk = n * this.stride
                let counts = {}

                for (let j = startj; j < startj + this.stride && j < this.height; j++) {
                    for (let k = startk; k < startk + this.stride && k < this.width; k++) {
                        let c = this.clusterID[j * this.width + k]
                        if (c != -1) {
                            if (counts[c]) {
                                counts[c]++
                            } else {
                                counts[c] = 1
                            }
                        }
                    }
                }
                let centerpos = -1
                let max = Number.MIN_VALUE
                for (let pos in counts) {
                    if (counts[pos] > max) {
                        max = counts[pos]
                        centerpos = pos
                    }
                }

                for (let j = startj; j < startj + this.stride && j < this.height; j++) {
                    for (let k = startk; k < startk + this.stride && k < this.width; k++) {
                        resultImage[4 * (j * this.width + k)] = this.rgbImage[4 * (this.centers[centerpos].x * this.width + this.centers[centerpos].y)]
                        resultImage[4 * (j * this.width + k) + 1] = this.rgbImage[4 * (this.centers[centerpos].x * this.width + this.centers[centerpos].y) + 1]
                        resultImage[4 * (j * this.width + k) + 2] = this.rgbImage[4 * (this.centers[centerpos].x * this.width + this.centers[centerpos].y) + 2]
                        resultImage[4 * (j * this.width + k) + 3] = this.rgbImage[4 * (this.centers[centerpos].x * this.width + this.centers[centerpos].y) + 3]
                    }
                }
            }
        }
        console.log("paiting done...................")
        return resultImage
    }

    //pixelate image
    pixelDeal(step, iters, stride, weight) {
        this.step = step
        this.iters = iters
        this.stride = stride
        this.weight = weight
        console.log("SLIC-step :", step)
        console.log("SLIC-iters :", iters)
        console.log("SLIC-weight :", weight)
        console.log("SLIC-stride :", stride)

        //tranlate rgb to lab
        for (let i = 0; i < this.width * this.height; i += 4) {
            let labColor = rgb2lab(this.imageArray[i], this.imageArray[i + 1], this.imageArray[i + 2])
            this.imageArray[i] = labColor.l
            this.imageArray[i + 2] = labColor.a
            this.imageArray[i + 3] = labColor.b
        }
        this.computePixel()
        let result = this.pickPixel()

        return result
    }
    changeBlockSize(blockSize) {
        this.step = blockSize
        this.computePixel()
        let result = this.pickPixel()
        return result
    }
    changeWeight(weight) {
        this.weight = weight
        this.computePixel()
        let result = this.pickPixel()
        return result
    }
    changeStride(stride) {
        this.stride = stride
        let result = this.pickPixel()
        return result
    }
    changeIters(iters) {
        this.iters = iters
        this.computePixel()
        let result = this.pickPixel()
        return result
    }


}