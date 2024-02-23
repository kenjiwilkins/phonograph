import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import AppBar from "./components/AppBar";
import Loading from "./components/Loading";
import PlayConfirmModal from "./components/PlayConfirmModal";
import { useAuth } from "./auth";
import { getUserProfile, getAllUserSavedAlbums } from "./api";
import { userState, userSavedAlbums } from "./data";
import { Album } from "./types";

function App() {
  const setUser = useSetRecoilState(userState);
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
          <main className="flex flex-col gap-2 p-4 max-w-full items-center justify-center">
            <div className="flex gap-2">
              <button
                className="bg-white text-black-700 p-2 rounded"
                onClick={() => handleAllUserSavedAlbums()}
              >
                Play Rundam Albums
              </button>
            </div>
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
