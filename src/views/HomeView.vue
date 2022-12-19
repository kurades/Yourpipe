<template>
  <v-container class="mt-6">
    <v-card>
      <v-card-title primary-title>
        <div>
          <h3 class="headline font-weight-black mb-0">
            {{ user?.username || null }}
          </h3>
          <div class="subtitle-1">{{ user?.email }}</div>
        </div>
      </v-card-title>
      <v-btn color="error" text dense @click="logout">Logout</v-btn>
    </v-card>

    <div>
      <v-text-field
        name="name"
        placeholder="Type link here"
        solo
        class="mt-3"
        :rules="youtubeRules"
        v-model="link"
        @keydown.enter="submitLink"
        :loading="submitLoading"
        :disabled="submitLoading"
      ></v-text-field>

      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-center" width="50">#</th>
              <th width="80"></th>
              <th>Title</th>
              <th width="30%">Uploader</th>
              <th width="10%">Duration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in audioList"
              class="cursor-pointer"
              :key="item._id"
              @click="activeSheet(item, index)"
            >
              <td>{{ index + 1 }}</td>
              <td>
                <v-img
                  :src="item.thumbnail"
                  width="70"
                  height="70"
                  class="ma-0"
                ></v-img>
              </td>
              <td>
                <span>{{ item.title }}</span>
              </td>
              <td>
                <span>{{ item.author.name }}</span>
              </td>
              <td>
                <span>{{ item.timeStamp }}</span>
              </td>
              <td>
                <v-btn
                  color="error"
                  @click.stop="deleteQueue(item.videoId)"
                  :loading="buttonLoading"
                  >Delete</v-btn
                >
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <bottom-sheet
      :sheet="sheet"
      :chosen="chosen"
      @nextTrack="nextTrack"
      @prevTrack="prevTrack"
    ></bottom-sheet>
  </v-container>
</template>

<script>
/* eslint-disable */
import { mapActions, mapState } from "vuex";
import BottomSheet from "@/components/BottomShett.vue";
export default {
  name: "HomeView",
  components: {
    BottomSheet,
  },
  data() {
    return {
      link: "",
      youtubeRules: [
        (v) =>
          /(?:youtube.[a-z]+\/[a-z\?\&]*v[/|=])([0-9a-zA-Z-_]+)/g.test(v) ||
          "The link should be https://www.youtube.com/watch?v=video_id",
      ],
      submitLoading: false,
      buttonLoading: false,
      sheet: false,
      chosen: null,
      index: -1,
    };
  },
  computed: {
    ...mapState(["user", "audioList"]),
    computedCurrent() {
      return this.fancyTimeFormat(this.current);
    },
  },

  methods: {
    ...mapActions(["logout", "getAudioList", "updateQueue", "deleteQueue"]),
    submitLink: async function () {
      this.submitLoading = true;
      const result =
        /(?:youtube.[a-z]+\/[a-z\?\&]*v[/|=])([0-9a-zA-Z-_]+)/g.exec(this.link);
      if (result.length === 2) {
        this.updateQueue(result[1]).then(() => {
          this.submitLoading = false;
          this.link = "";
        });
      }
    },

    activeSheet: function (item, index) {
      this.chosen = item;
      this.sheet = true;
      this.index = index;
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
    nextTrack: function () {
      if (this.audioList.length > ++this.index)
        this.chosen = this.audioList[this.index];
    },
    prevTrack: function () {
      if (--this.index >= 0)
        this.chosen = this.audioList[this.index];
    },
  },
  created() {
    this.getAudioList();
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>