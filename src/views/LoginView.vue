<template>
  <v-main>
    <v-container fluid class="full">
      <v-img class="position-absolute" width="100%" height="100vh"
        src="https://pbs.twimg.com/media/Fagm89gaAAAebl6?format=jpg&name=4096x4096">
        <v-form v-model="valid" ref="form" class="custom-form d-flex flex-column">
          <div class="d-flex align-center">
            <span class="mx-2">Sign In</span>
            <v-switch v-model="isSignUp" color="indigo darken-4"></v-switch>
            <span class="mx-2 ">Sign Up</span>
          </div>
          <div v-if="!isSignUp">
            <label>Email</label>
            <v-text-field class="white--text" v-model="email" :rules="emailRules" :counter="50" solo
              append-icon="mdi-account" required></v-text-field>
            <label>Password</label>
            <v-text-field v-model="password" solo :rules="passwordRules" append-icon="mdi-lock" type="password" required
              @keydown.enter="submit"></v-text-field>
          </div>
          <div v-else>
            <label>How can we call you?</label>
            <v-text-field class="white--text" v-model="reg.username" :counter="50" solo append-icon="mdi-account"
              required></v-text-field>
            <label>Email</label>
            <v-text-field class="white--text" v-model="reg.email" :rules="emailRules" :counter="50" solo
              append-icon="mdi-account" required></v-text-field>
            <label>Password</label>
            <v-text-field v-model="reg.password" solo :rules="passwordRules" append-icon="mdi-lock" type="password"
              required @keydown.enter="submit"></v-text-field>
          </div>
          <v-alert dense text type="error" v-if="error">{{ error }}</v-alert>
          <v-btn @click="submit" :disabled="!valid && !isLoading">
            <v-progress-circular v-if="isLoading" indeterminate color="primary" size="20"></v-progress-circular>
            <span v-else>submit</span>
          </v-btn>
        </v-form>
      </v-img>
    </v-container>
  </v-main>
</template>

<script>
import { mapActions, mapState } from "vuex";
import router from "../router";
export default {
  data: () => ({
    error: null,
    isLoading: false,
    valid: true,
    isSignUp: false,
    reg: {
      username: "",
      email: "",
      password: "",
    },
    email: "test@123.com",
    password: "123456",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) =>
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
          v
        ) || "E-mail must be valid",
    ],
    passwordRules: [(v) => !!v || "Password is required"],
  }),
  computed: {
    ...mapState(["user"]),
  },
  methods: {
    ...mapActions(["login", "register"]),
    submit() {
      if (this.isSignUp) {
        if (this.$refs.form.validate()) {
          this.isLoading = true;
          this.register({ username: this.reg.username, email: this.reg.email, password: this.reg.password })
            .then(() => {
              this.isLoading = false;
              router.push({ path: "/" });
            })
            .catch((error) => {
              this.isLoading = false;
              this.error = error;
            });
        }
      } else {
        if (this.$refs.form.validate()) {
          this.isLoading = true;
          this.login({ email: this.email, password: this.password })
            .then(() => {
              this.isLoading = false;
              router.push({ path: "/" });
            })
            .catch((error) => {
              this.isLoading = false;
              this.error = error;
            });
        }
      }
    },
  },
};
</script>

<style scoped>
.full {
  padding: 0;
}

.custom-form {
  background-image: linear-gradient(-125deg,
      rgba(255, 255, 255, 0.5),
      rgba(255, 255, 255, 0.3));
  border-radius: 10px;
  padding: 20px;
  backdrop-filter: blur(10px);
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  width: 600px;
  margin: auto;
}
</style>
