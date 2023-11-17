import { atom } from "recoil";
import { Album, User } from "../types";
const localStorageEffect =
  (key: string) =>
  ({ setSelf, onSet }: any) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue: any, _: any, isReset: any) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

export const userLoggedInState = atom({
  key: "userLoggedInState",
  default: false,
});

export const userToken = atom({
  key: "userToken",
  default: "",
  effects: [localStorageEffect("userToken")],
});

export const userAuthCode = atom({
  key: "userAuthCode",
  default: "",
  effects: [localStorageEffect("userAuthCode")],
});

export const userState = atom<User | null>({
  key: "userState",
  default: null,
  effects: [localStorageEffect("user")],
});

export const userSavedAlbums = atom<Album[]>({
  key: "userSavedAlbums",
  default: [],
});
