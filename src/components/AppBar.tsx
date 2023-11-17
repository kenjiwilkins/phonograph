import { useRecoilState } from "recoil";
import { userState } from "../data";

function AppBar() {
  const [user] = useRecoilState(userState);
  const isLogin = user ? true : false;
  return (
    <>
      <div
        id="app_bar"
        className="app_bar flex justify-between items-center h-16 bg-black-900 py-4 px-6 w-full"
      >
        <h1 id="logo" className="logo font-logo text-white">
          PHONOGRAPH
        </h1>
        {isLogin ? (
          <button
            v-if="user"
            id="user"
            className="user flex py-2 px-2 bg-black-900 gap-2 text-white hover:brightness-125"
          >
            <img
              src={user?.images[0].url}
              alt={user?.display_name}
              className="h-6 w-6 rounded-full"
            />
            <span>{user?.display_name}</span>
          </button>
        ) : (
          <button className="flex py-1 px-2 bg-gray-800 rounded-md gap-2 text-white hover:brightness-110">
            Login
          </button>
        )}
      </div>
    </>
  );
}

export default AppBar;
