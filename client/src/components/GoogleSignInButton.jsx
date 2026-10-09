import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { googleLogin } from "../redux/slices/authSlice";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";

const GoogleSignInButton = () => {
  const dispatch = useDispatch();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        // Send to backend for authentication
        dispatch(googleLogin({
          email: userInfo.data.email,
          name: userInfo.data.name,
          googleId: userInfo.data.sub,
          picture: userInfo.data.picture,
        }));
      } catch (error) {
        console.error("Google login error:", error);
      }
    },
    onError: (error) => {
      console.error("Google login failed:", error);
    },
  });

  return (
    <button
      onClick={() => login()}
      type="button"
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      <FaGoogle className="text-xl text-red-500" />
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleSignInButton;
