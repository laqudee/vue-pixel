<template>
  <div>
    <input id="filebtn" ref="filebtn" type="file" hidden />
    <canvas id="canvas" ref="canvas" class="hidden" width="200px" height="200px"
      >Sorry, your browser dose not support canvas.</canvas
    >
    <canvas
      id="canvas_centers"
      ref="canvas_centers"
      width="200px"
      height="200px"
    ></canvas>
    <canvas
      id="canvas_contours"
      ref="canvas_contours"
      width="200px"
      height="200px"
    ></canvas>
    <div id="loadingbox" ref="loadingbox">
      <div class="circle"></div>
    </div>
    <hello-world></hello-world>
  </div>
</template>

<script>
import "./css/index.css"; // 引入全局样式表
import exampleImage from "./assets/zanghu-1.jpg";
import * as dat from "dat.gui"; // 引入dat.gui组件
import padText from "./libs/padText"; // 引入padText类
import SLIC from "./libs/SLIC.js";
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  data() {
    return {
      filedom: null,
      padtext: null,
      canvas: null,
      loadingbox: null,
      context: null,
      canvas_centers: null,
      context_centers: null,
      canvas_contours: null,
      context_contours: null,
      config: {
        blockSize: 20, // 超像素点大小
        weight: 30, // 颜色空间权重
        iters: 10, // 迭代次数
        stride: 10, // 步长
        withGrid: true, // 是否绘制像素网格
        withCenters: false, // 是否显示聚类中心
        withContours: false, // 是否显示聚类边缘轮廓
      },
      pixelImage: null,
      slic: null,
      filename: "example",
      filetype: "image/jpeg",
    };
  },
  methods: {
    initGUI() {
      let that = this;
      this.padtext = new padText(
        this.filedom,
        this.config,
        this.canvas,
        this.filetype,
        this.filename
      );
      var gui = new dat.GUI();
      gui.add(this.padtext, "Upload Image");

      // iters
      // 迭代次数控制器
      var iters_controller = gui.add(this.padtext, "iters", 5, 20);
      iters_controller.onFinishChange(function (value) {
        console.log("new iters: ", Math.round(value));
        if (!that.slic) {
          alert("Upload image first");
        } else {
          that.pixelImage = that.slic.changeIters(Math.round(value));
          that.displayImg();
          that.displayCenters();
          that.displayContours();
        }
      });

      //stride for pixel
      // 步长控制器
      var stride_controller = gui.add(this.padtext, "stride", 5, 20);
      stride_controller.onFinishChange(function (value) {
        console.log("new stride: ", Math.round(value));
        if (!that.slic) {
          alert("Upload image first");
        } else {
          that.config.stride = Math.round(value);
          that.pixelImage = that.slic.changeStride(that.config.stride);
          that.displayImg();
        }
      });

      //blocksize
      // 超像素大小控制器
      var blockSize_controller = gui.add(that.padtext, "blockSize", 10, 30);
      blockSize_controller.listen();
      blockSize_controller.onFinishChange(function (value) {
        console.log("new blockSize: ", Math.round(value));
        if (!that.slic) {
          alert("Upload image first");
        } else {
          that.pixelImage = that.slic.changeBlockSize(Math.round(value));
          that.displayImg();
          that.displayCenters();
          that.displayContours();
        }
      });

      this.padtext.blockSize = 9;

      //weight
      // 权重控制器
      var weight_controller = gui.add(this.padtext, "weight", 1, 40);
      weight_controller.onFinishChange(function (value) {
        console.log("new iters: ", Math.round(value));
        if (!that.slic) {
          alert("Upload image first");
        } else {
          that.pixelImage = that.slic.changeWeight(Math.round(value));
          that.displayImg();
          that.displayCenters();
          that.displayContours();
        }
      });

      this.padtext.weight = 8;

      //grid
      // 像素网格
      var grid_controller = gui.add(this.padtext, "grid");
      grid_controller.onFinishChange(function (value) {
        console.log("像素网格value：", value);
        that.config.withGrid = value;
        that.displayImg();
      });

      //centers
      // 聚类中心控制器
      var centers_controller = gui.add(this.padtext, "Centers");
      centers_controller.onFinishChange(function (value) {
        console.log(value);
        that.config.withCenters = value;
        that.displayCenters(value);
      });

      //contours
      // 聚类边界控制器
      var contours_controller = gui.add(this.padtext, "Contours");
      contours_controller.onFinishChange(function (value) {
        console.log(value);
        that.config.withContours = value;
        that.displayContours(value);
      });

      //dowload img
      gui.add(this.padtext, "Export image");

      // read file
      this.filedom.addEventListener("change", function (e) {
        let f = this.files[0];
        that.filename = f.name;
        that.filetype = f.type;
        if (!f.type.match("image.*")) {
          return;
        }
        let reader = new FileReader();
        reader.onload = function (event) {
          let bytes = this.result;
          let img = new Image();
          img.src = "" + bytes;
          img.onload = function () {
            that.dealImg(img);
          };
        };
        reader.readAsDataURL(f);
      });
    },

    // 处理图像
    dealImg(img) {
      console.log('img.width: ', img.width);
      console.log('img.height: ', img.height);
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.canvas.style.width = img.width + "px";
      this.canvas.style.height = img.height + "px";
      this.canvas.style.marginLeft = -img.width / 2 + "px";
      this.canvas.style.marginTop = -img.height / 2 + "px";

      this.canvas_centers.width = img.width;
      this.canvas_centers.height = img.height;
      this.canvas_centers.style.width = img.width + "px";
      this.canvas_centers.style.height = img.height + "px";
      this.canvas_centers.style.marginLeft = -img.width / 2 + "px";
      this.canvas_centers.style.marginTop = -img.height / 2 + "px";

      this.canvas_contours.width = img.width;
      this.canvas_contours.height = img.height;
      this.canvas_contours.style.width = img.width + "px";
      this.canvas_contours.style.height = img.height + "px";
      this.canvas_contours.style.marginLeft = -img.width / 2 + "px";
      this.canvas_contours.style.marginTop = -img.height / 2 + "px";

      this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

      // canvasData数据
      let canvasData = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      // 二进制数据
      let binaryData = canvasData.data;
      let nr_superpixels = 500;
      this.config.blockSize = this.padtext.blockSize = Math.round(
        Math.sqrt((this.canvas.width * this.canvas.height) / nr_superpixels)
      );
      console.log("app-blockSize: ", this.padtext.blockSize);
      this.slic = new SLIC(binaryData, this.canvas.width, this.canvas.height);
      console.log("app-slic: ", this.slic);
      this.pixelImage = this.slic.pixelDeal(
        this.config.blockSize,
        this.config.iters,
        this.config.stride,
        this.config.weight
      );
      this.displayImg();
    },

    // 展示图片
    displayImg() {
      let imgData = this.context.createImageData(
        this.canvas.width,
        this.canvas.height
      );
      // console.log('pixelImage: ', this.pixelImage);
      for (let i = 0; i < this.pixelImage.length; i++)
        imgData.data[i] = this.pixelImage[i];
      this.context.putImageData(imgData, 0, 0);

      // 如果使用了像素网格的操作
      if (this.config.withGrid) {
        this.context.strokeStyle = "white";
        this.context.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += this.config.stride) {
          this.context.beginPath();
          this.context.moveTo(i, 0);
          this.context.lineTo(i, canvas.height);
          this.context.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += this.config.stride) {
          this.context.beginPath();
          this.context.moveTo(0, i);
          this.context.lineTo(canvas.width, i);
          this.context.stroke();
        }
      }
    },

    displayCenters() {
      // 打开绘制聚类中心点开关
      if (this.config.withCenters) {
        this.canvas_centers.style.display = "block";
        this.canvas_centers.width = this.canvas_centers.width;
        this.slic.showCenters(this.context_centers);
      } else {
        // 显示
        this.canvas_centers.style.display = "none";
      }
    },

    displayContours() {
      // 绘制聚类边界
      if (this.config.withContours) {
        this.canvas_contours.style.display = "block";
        this.canvas_contours.width = this.canvas_contours.width;
        this.slic.showContours(this.context_contours);
      } else {
        // 不显示
        this.canvas_contours.style.display = "none";
      }
    },

    hidden(dom, flag) {
      if (flag) dom.className = "hidden";
      else dom.className = "";
    },
  },
  mounted() {
    // 初始化操作
    this.filedom = this.$refs.filebtn;
    this.canvas = this.$refs.canvas;
    this.loadingbox = this.$refs.loadingbox;
    this.context = this.canvas.getContext("2d");
    this.canvas_centers = this.$refs.canvas_centers;
    this.context_centers = this.canvas_centers.getContext("2d");
    this.canvas_contours = this.$refs.canvas_contours;
    this.context_contours = this.canvas_contours.getContext("2d");

    // 初始化initGUI
    this.initGUI();

    this.hidden(this.loadingbox, false);
    let img = new Image();
    img.src = exampleImage;
    // console.log("img: ", img);
    let that = this;
    img.onload = function () {
      that.dealImg(img);
      that.hidden(that.canvas, false);
      that.hidden(that.loadingbox, true);
    };
  },
  created() {},
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
