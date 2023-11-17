import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useRecoilState } from "recoil";
import AppBar from "./components/AppBar";
import Loading from "./components/Loading";
import PlayConfirmModal from "./components/PlayConfirmModal";
import { useAuth } from "./auth";
import { getUserProfile, getAllUserSavedAlbums } from "./api";
import { userState, userSavedAlbums } from "./data";
import { Album } from "./types";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [user, setUser] = useRecoilState(userState);
  const [albums, setAlbums] = useRecoilState(userSavedAlbums);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [randomAlbum, setRandomAlbum] = useState<Album>();
  const artistName = randomAlbum?.artists
    .map((artist) => artist.name)
    .join(", ");
  async function handleClickGetProfile() {
    getUserProfile().then((res) => {
      setUser(res);
    });
  }
  async function handleAuth() {
    await useAuth();
    await handleClickGetProfile();
  }
  async function handleAllUserSavedAlbums() {
    setIsLoading(true);
    await getAllUserSavedAlbums()
      .then(async (res) => {
        playRandomAlbum(res);
        flushSync(() => {
          setAlbums(res);
        });

        setIsLoading(false);
        setIsModalOpen(true);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }
  async function playRandomAlbum(albums: Album[]) {
    if (!albums.length) {
      return;
    }
    const result = albums[Math.floor(Math.random() * albums.length)];
    setRandomAlbum(result);
  }
  function handlePlay() {
    location.href = randomAlbum?.external_urls.spotify || "";
  }
  useEffect(() => {
    handleAuth();
  }, []);
  return (
    <>
      <div className="bg-black-700 h-screen">
        <AppBar />
        {isLoading ? (
          <Loading />
        ) : (
          <main className="flex flex-col gap-2 p-4 max-w-full">
            <div className="flex gap-2">
              <button
                className="bg-white text-black-700 p-2 rounded"
                onClick={() => useAuth()}
              >
                auth
              </button>
              <button
                className="bg-white text-black-700 p-2 rounded"
                onClick={() => handleClickGetProfile()}
              >
                getUserProfile
              </button>
              <button
                className="bg-white text-black-700 p-2 rounded"
                onClick={() => handleAllUserSavedAlbums()}
              >
                get Albums
              </button>
            </div>
            <a href="https://vitejs.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
            <div className="text-white">{JSON.stringify(albums)}</div>
          </main>
        )}
        {isModalOpen && (
          <PlayConfirmModal
            albumId={randomAlbum?.id || ""}
            albumImageSrc={randomAlbum?.images[0].url || ""}
            albumTitle={randomAlbum?.name || ""}
            artistName={artistName || ""}
            onPlay={() => handlePlay()}
            onNext={() => playRandomAlbum(albums)}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </>
  );
}

export default App;
