import Vue from 'vue'
import Vuex from 'vuex'
import { BASE_URL } from '@/constant'
import Axios from 'axios'
import router from '@/router'
Vue.use(Vuex)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
const axios = Axios.create({
  baseURL : BASE_URL
})
export default new Vuex.Store({
  state: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    audioList: null,
  },
  getters: {
  },
  mutations: {
    setAudioList(state, payload) {
      state.audioList = payload;
    },
    addAudioList(state, payload) {
      state.audioList.push(payload)
    },
    removeAudioList(state){
      state.audioList = null;
    }
  },
  actions: {
    async login({ state }, payload) {
      const { email, password } = payload;
      state.user = await axios({
        withCredentials: true,
        method: "POST",
        url: '/api/users/login',
        data: {
          email,
          password,
        },
      })
        .then((value) => {
          state.user = value.data;
          localStorage.setItem("user", JSON.stringify(value.data))
          console.log(value);
          return value.data
        })
        .catch((value) => {
          throw value.response.data;
        })
    },
    async register({ state }, payload) {
      const { username, email, password } = payload;
      state.user = await axios({
        withCredentials: true,
        method: "POST",
        url: 'api/users/register',
        data: {
          username,
          email,
          password,
        },
      })
        .then((value) => {
          state.user = value.data;
          localStorage.setItem("user", JSON.stringify(value.data))
          console.log(value);
          return value.data
        })
        .catch((value) => {
          throw value.response.data;
        })
    },

    logout({ state,commit }) {
      localStorage.removeItem("user");
      state.user = null;
      router.push({ name: 'login' });
      commit('removeAudioList')
    },

    async getAudioList({ state, commit }) {
      state.audioList = await axios({
        method: "GET",
        url: '/api/music/queue',
        withCredentials: true,
        headers: {
          'auth-token': getCookie('token'),
        },

      }).then((value) => {
        state.audioList = value.data;
        let a = state.audioList.map(v => v.data)
        commit('setAudioList', a)
        return state.audioList
      })
        .catch((err) => console.log(err))
    },

    async updateQueue({ state, commit }, payload) {
      state.audioList = await axios({
        method: "PUT",
        url: '/api/music/queue',
        headers: {
          "auth-token": getCookie('token'),
        },
        params: {
          videoId: payload,
          userId: state.user._id,
        }

      }).then((value) => {
        commit('addAudioList', value.data)
        return state.audioList
      })
    },
    async deleteQueue({ state }, payload) {
      await axios.delete(`/api/music/queue`, {
        headers: {
          'auth-token': getCookie('token'),
        },
        params: {
          videoId: payload,
          userId: state.user._id,
        }
      }).then(() => {
        let i = state.audioList.findIndex(v => v.videoId === payload)
        state.audioList.splice(i, 1);
      })
    }
  },
  modules: {
  }
})
