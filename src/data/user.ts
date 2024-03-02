import { defineStore } from "pinia";
import { User } from "../types";
import { getUserProfile } from "../api";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: "",
    authCode: "",
    accessToken: "",
    loggedInState: false,
    user: null as User | null,
  }),
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setAuthCode(authCode: string) {
      this.authCode = authCode;
    },
    setAccessToken(accessToken: string) {
      this.accessToken = accessToken;
    },
    setLoggedInState(loggedInState: boolean) {
      this.loggedInState = loggedInState;
    },
    setUser(user: User) {
      this.user = user;
    },
    async getUser() {
      try {
        const user = await getUserProfile();
        this.setUser(user);
        this.setLoggedInState(true);
      } catch (error) {
        if (error) {
          console.log(error);
          this.setLoggedInState(false);
          return Promise.reject(error);
        }
      }
    },
  },
  persist: true,
});
