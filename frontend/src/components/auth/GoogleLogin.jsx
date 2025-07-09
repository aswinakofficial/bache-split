import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/AuthContext";

export default function GoogleLoginButton() {
  const { login } = useAuth();

  return (
    <GoogleLogin
      onSuccess={credentialResponse => login(credentialResponse.credential)}
      onError={() => alert("Google Login Failed")}
      useOneTap
    />
  );
}