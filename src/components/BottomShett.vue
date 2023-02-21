<template>
  <v-bottom-sheet v-model="sheetToggle" eager hide-overlay persistent no-click-animation :retain-focus="false">
    <v-sheet height="100px" class="d-flex">
      <v-row>
        <v-col cols="4" class="col-n1 d-flex flex-grow-0">
          <div>
            <v-img :src="chosen?.thumbnail" width="80" height="80" class="ma-2"></v-img>
          </div>
          <div class="ma-2 d-flex flex-column justify-center">
            <p class="mb-0">{{ chosen?.title }}</p>
            <p class="text-caption">{{ chosen?.author.name }}</p>
          </div>
        </v-col>
        <v-col class="col-n2 d-flex justify-center align-center flex-grow-0">
          <div class="control-player">
            <div class="controller d-flex justify-center mb-3">
              <v-icon>mdi-shuffle</v-icon>
              <v-icon @click="prevTrack">mdi-skip-previous</v-icon>
              <div @click="play" class="play-container">
                <v-icon v-show="audioPaused">mdi-play</v-icon>
                <v-icon v-show="!audioPaused">mdi-pause</v-icon>
              </div>
              <v-icon @click="nextTrack">mdi-skip-next</v-icon>
              <v-icon @click="setLoop" :style="{ color: isLoop ? '' : 'rgba(255,255,255,.3)' }">mdi-repeat</v-icon>
            </div>
            <audio ref="audio" @timeupdate="timeUpdate" @ended="nextTrack" :src="chosen ? chosen.audioUrl : ''"
              :loop="isLoop" :autoplay="autoplay"></audio>
            <div class="audio-info d-flex align-center">
              <span class="text-caption">{{ computedCurrent }}</span>
              <div class="progress-bar mx-2">
                <div class="progress-bar-length" :style="{ transform: `translateX(${line || '-100%'})` }"></div>
              </div>
              <span class="text-caption">{{
                chosen?.timeStamp || "0:00"
              }}</span>
            </div>
          </div>
        </v-col>
        <v-col class="col-n3 d-flex justify-center align-center flex-grow-1 ">
          <v-slider color="#dc1f1f" step="1" min="0" max="100" v-model="volume" thumb-label
            class="volume-slider flex-grow-0">
            <template v-slot:prepend>
              <div @click="setMuted">
                <v-icon v-if="volume == 0">mdi-volume-off</v-icon>
                <v-icon v-else-if="volume <= 50">mdi-volume-medium</v-icon>
                <v-icon v-else>mdi-volume-high</v-icon>
              </div>
            </template>
          </v-slider>
          <!-- <div id="rangeContainer" ref="rangeContainer">
            <div id="track" ref="track"></div>
            <div id="thumb" ref="thumb"></div>
          </div> -->
        </v-col>
      </v-row>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script>
export default {
  props: ["sheet", "chosen"],
  data() {
    return {
      player: this.$refs.audio,
      audioPaused: true,
      autoplay: false,
      current: 0,
      line: null,
      sheetToggle: true,
      volume: 50,
      isLoop: false,
      rangeContainer: this.$refs.rangeContainer,
      thumb: this.$refs.thumb,
      track: this.$refs.track,
    };
  },
  computed: {
    computedCurrent() {
      return this.fancyTimeFormat(this.current);
    },
  },
  watch: {
    sheet(next) {
      this.sheetToggle = next;
    },
    computedCurrent() {
      this.line = (this.current / this.player?.duration) * 100 - 100 + "%";
    },
    volume() {
      localStorage.setItem('md_volume', this.volume)
      this.player.volume = this.volume / 100
    },

  },
  methods: {
    play: function () {
      if (this.audioPaused) {
        this.audioPaused = false;
        this.player.play();
      } else {
        this.audioPaused = true;
        this.player.pause();
      }
    },
    fancyTimeFormat: function (duration) {
      var hrs = ~~(duration / 3600);
      var mins = ~~((duration % 3600) / 60);
      var secs = ~~duration % 60;
      var ret = "";

      if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
      }
      ret += "" + mins + ":" + (secs < 10 ? "0" : "");
      ret += "" + secs;
      return ret;
    },
    setVolume: function (value) {
      this.volume += value;
    },
    setMuted: function () {
      if (this.volume != 0) {
        this.volume = 0;
      } else {
        this.volume = 50;
      }
    },
    setLoop: function () {
      this.isLoop = !this.isLoop;
    },
    timeUpdate: function () {
      this.current = this.player?.currentTime;
      return this.current;
    },
    nextTrack: function () {
      this.$emit("nextTrack");
      this.current = 0;
      if (!this.audioPaused) {
        this.autoplay = true;
        this.audioPaused = false;
      } else {
        this.autoplay = false;
      }
    },
    prevTrack: function () {
      this.$emit("prevTrack");
      this.current = 0;
      if (!this.audioPaused) {
        this.autoplay = true;
        this.audioPaused = false;
      }
    },
    jump: function (time) {
      this.player.currentTime += time;
    },
    handleKeydown: function (e) {

      if (this.chosen) {
        switch (e.code) {
          case "ArrowRight":
            this.jump(3);
            break;
          case "ArrowLeft":
            this.jump(-3);
            break;
          case "ArrowUp":
            this.setVolume(5);
            break;
          case "ArrowDown":
            this.setVolume(-5);
            break;
          case "Space":
            this.play();
            break;
          case "KeyL":
            this.setLoop();
            break;
          case "KeyN":
            this.nextTrack();
            break;
          case "KeyV":
            this.prevTrack();
            break;
        }
      }
    },
  },
  mounted() {
    this.player = this.$refs.audio;
    window.addEventListener("keydown", this.handleKeydown);

    //     // test

    //     let isDragging = false;
    // let currentX;
    // let newLeft;
    // this.rangeContainer = this.$refs.rangeContainer
    // this.track = this.$refs.track
    // this.thumb = this.$refs.thumb

    // window.addEventListener("mousedown", function (e) {
    //   isDragging = true;
    //   currentX = e.clientX - this.rangeContainer.offsetLeft;
    //   newLeft = currentX - this.thumb.offsetWidth / 2;

    //   setPosition();
    // });

    // window.addEventListener("mouseup", function () {
    //   isDragging = false;
    // });

    // window.addEventListener("mousemove", (e) => {
    //   if (!isDragging) return;
    //   currentX = e.clientX - this.rangeContainer.offsetLeft;
    //   newLeft = currentX - this.thumb.offsetWidth / 2;

    //   setPosition();
    // });

    // var setPosition = () => {
    //   if (newLeft < 0) {
    //     newLeft = 0;
    //   }
    //   else if (newLeft > this.track.offsetWidth - this.thumb.offsetWidth) {
    //     newLeft = this.track.offsetWidth - this.thumb.offsetWidth;
    //   }
    //   this.thumb.style.left = newLeft + "px";
    // }

  },
  unmounted() {
    window.removeEventListener("keydown", this.handleKeydown);
  },
  created() {
    if (localStorage.getItem('md_volume') === null) {
      localStorage.setItem('md_volume', 50)
      this.volume = 50;
    } else {
      this.volume = localStorage.getItem('md_volume')
    }


  },

};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.progress-bar {
  width: 500px;
  height: 5px;
  background: rgb(196, 196, 196);
  border-radius: 10px;
  overflow: hidden;
}

.controller>* {
  margin: 0 5px;
}

.play-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #dc1f1f;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.play-container>i {
  font-size: 2rem;
}

.progress-bar-length {
  width: 500px;
  height: 5px;
  border-radius: 10px;
  background: red;
}

.controller {
  justify-content: center;
  align-items: center;
}

.volume-slider {
  width: 300px;
}


/* tyest */
#rangeContainer {
  width: 300px;
  height: 50px;
  position: relative;
}

#track {
  width: 100%;
  height: 10px;
  background-color: #ddd;
  border-radius: 5px;
  position: absolute;
  top: 20px;
  left: 0;
}

#thumb {
  width: 20px;
  height: 20px;
  background-color: #4caf50;
  border-radius: 50%;
  position: absolute;
  top: 5px;
  left: 0;
  cursor: pointer;
}
</style>