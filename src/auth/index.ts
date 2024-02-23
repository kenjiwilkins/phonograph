import { isDev } from "../utils";
import { getLocalStorage, setLocalStorage, resetAccessToken } from "../utils";

const clientId = import.meta.env.VITE_APP_SPOTIFY_CLIENT_ID;
const deployURL = import.meta.env.VITE_APP_DEPLOY_URL || "";
// let code = "";
export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append(
    "redirect_uri",
    isDev ? "http://localhost:5173/" : "https://spotify-clone-5173.vercel.app/"
  );
  params.append(
    "scope",
    "user-read-private user-read-email user-library-read user-read-playback-state user-modify-playback-state"
  );
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(
  clientId: string,
  code: string
): Promise<string> {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", isDev ? "http://localhost:5173/" : deployURL);
  params.append("code_verifier", verifier!);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (result.status !== 200) {
    console.log("error");
  }
  const { access_token } = await result.json();
  window.history.pushState(null, "", "/");
  return access_token;
}

function generateCodeVerifier(length: number) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function getCode() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("code");
}

export function getAccessTokenFromLocalStorage() {
  const accessToken = getLocalStorage("accessToken");
  if (!accessToken) {
    return "";
  }
  if (accessToken === "undefined") {
    resetAccessToken();
    return "";
  }
  return localStorage.getItem("accessToken");
}

export async function useAuth() {
  const code = getCode();
  if (!getAccessTokenFromLocalStorage() && !code) {
    return redirectToAuthCodeFlow(clientId);
  } else {
    const accessToken = await getAccessToken(clientId, code!);
    return setLocalStorage("accessToken", accessToken);
  }
}
