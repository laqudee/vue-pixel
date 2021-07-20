<template>
  <!-- 图片上传、解析与下载 -->
  <div class="hello">
    <input type="file" ref="filebtn2" @click="clickFile">
    <div ref="imgdom"></div>
    <button ref="download" @click="downloadFile">下载文件</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      filedom2: null,
      fileName: '',
      fileType: '',
    }
  },
  methods: {
    clickFile() {
      let that = this;
      this.filedom2 = this.$refs.filebtn2;
      this.filedom2.addEventListener("change", function(e) {
        let f = this.files[0]
        console.log('f: ', f);
        that.fileName = f.name
        that.fileType = f.type 
        if (!f.type.match("image.*")) {
          return;
        }
        let reader = new FileReader();
        reader.onload = function(event) {
          let bytes = this.result;
          let img = new Image();
          img.src = "" + bytes;
          img.id = "imgs";
          img.style.width = '100px';
          img.style.height = '100px';
          img.onload = function () {
            that.$refs.imgdom.appendChild(img)
          }
        }
        reader.readAsDataURL(f);
      })
    },
    downloadFile(){
      if (!this.fileName) {
        alert('请先上传一个图片！')
        return
      }
      let MIME_TYPE = this.fileType;
      let imgs = document.getElementById("imgs")
      let imgURL = imgs.src;
      var link = document.createElement('a')
      link.download = this.fileName
      link.href = imgURL
      link.dataset.downloadurl = [MIME_TYPE, link.download, link.href].join(':')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  },
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
