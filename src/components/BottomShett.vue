<template>
  <v-bottom-sheet
    v-model="sheetToggle"
    eager
    hide-overlay
    persistent
    no-click-animation
    :retain-focus="false"
  >
    <v-sheet height="100px" class="d-flex">
      <v-row>
        <v-col cols="4" class="col-n1 d-flex">
          <div>
            <v-img
              :src="chosen?.thumbnail"
              width="80"
              height="80"
              class="ma-2"
            ></v-img>
          </div>
          <div class="ma-2 d-flex flex-column justify-center">
            <p class="mb-0">{{ chosen?.title }}</p>
            <p class="text-caption">{{ chosen?.author.name }}</p>
          </div>
        </v-col>
        <v-col class="col-n2 d-flex justify-center align-center">
          <div class="control-player">
            <div class="controller d-flex justify-center mb-3">
              <v-icon>mdi-shuffle</v-icon>
              <v-icon @click="prevTrack">mdi-skip-previous</v-icon>
              <div @click="play" class="play-container">
                <v-icon v-show="audioPaused">mdi-play</v-icon>
                <v-icon v-show="!audioPaused">mdi-pause</v-icon>
              </div>
              <v-icon @click="nextTrack">mdi-skip-next</v-icon>
              <v-icon
                @click="setReplay"
                :style="{ color: replay ? '' : 'rgba(255,255,255,.3)' }"
                >mdi-repeat</v-icon
              >
            </div>
            <audio
              ref="audio"
              @timeupdate="timeUpdate"
              @ended="nextTrack"
              :src="chosen ? chosen.audioUrl : ''"
              :loop="replay"
              :autoplay="autoplay"
            ></audio>
            <div class="audio-info d-flex align-center">
              <span class="text-caption">{{ computedCurrent }}</span>
              <div class="progress-bar mx-2">
                <div
                  class="progress-bar-length"
                  :style="{ transform: `translateX(${line || '-100%'})` }"
                ></div>
              </div>
              <span class="text-caption">{{
                chosen?.timeStamp || "0:00"
              }}</span>
            </div>
          </div>
        </v-col>
        <v-col cols="4" class="col-n3 d-flex justify-center align-center">
          <div @click="setMuted">
            <v-icon v-if="volume == 0">mdi-volume-off</v-icon>
            <v-icon v-else-if="volume <= 0.5">mdi-volume-medium</v-icon>
            <v-icon v-else>mdi-volume-high</v-icon>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            v-model="volume"
            @change="setVolume"
            id="volume"
          />
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
      sheetToggle: true,
      audioPaused: true,
      current: 0,
      line: null,
      volume: 1,
      replay: false,
      autoplay: false,
    };
  },
  computed: {
    computedCurrent() {
      // console.log(this.current);
      return this.fancyTimeFormat(this.current);
    },
  },
  watch: {
    sheet(next) {
      this.sheetToggle = next;
    },
    computedCurrent() {
      this.line = (this.current / this.au?.duration) * 100 - 100 + "%";
    },
  },
  methods: {
    play: function () {
      if (this.audioPaused) {
        this.audioPaused = false;
        this.au.play();
      } else {
        this.audioPaused = true;
        this.au.pause();
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
    setVolume: function () {
      if (this.au) {
        this.au.volume = this.volume;
      }
    },
    setMuted: function () {
      if (this.volume != 0) {
        this.volume = 0;
        this.setVolume();
      } else {
        this.volume = 1;
        this.setVolume();
      }
    },
    setReplay: function () {
      if (this.replay) {
        this.replay = false;
      } else {
        this.replay = true;
      }
    },
    timeUpdate: function () {
      this.current = this.au?.currentTime;
      // console.log(this.current,this.au.duration);
      return this.current;
    },
    nextTrack: function () {
      this.$emit("nextTrack");
      this.current = 0;
      if(!this.audioPaused){
        this.autoplay = true;
        this.audioPaused = false;
      }else{
        this.autoplay = false;
      }
    },
    prevTrack: function () {
      this.$emit("prevTrack");
      this.current = 0;
      if(!this.audioPaused){
        this.autoplay = true;
        this.audioPaused = false;
      }
    },
    jump: function (time) {
      this.au.currentTime += time;
    },
    handleKeydown: function (e) {
      // console.log(e.code);

      if (this.chosen) {
        switch (e.code) {
          case "ArrowRight":
            this.jump(3);
            break;
          case "ArrowLeft":
            this.jump(-3);
            break;
          case "Space":
            this.play();
            break;
          case "KeyL":
            this.setReplay();
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
    this.au = this.$refs.audio;
    window.addEventListener("keydown", this.handleKeydown);
  },
  unmounted() {
    window.removeEventListener("keydown", this.handleKeydown);
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
  background: white;
  border-radius: 10px;
  overflow: hidden;
}
.controller > * {
  margin: 0 5px;
}
.play-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: red;
  display: flex;
  justify-content: center;
  align-items: center;
}
.play-container > i {
  font-size: 2rem;
}
.progress-bar-length {
  width: 500px;
  height: 5px;
  border-radius: 10px;
  background: green;
}
.controller {
  justify-content: center;
  align-items: center;
}

#volume {
  height: 4px;
}
</style>