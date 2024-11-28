"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Email and Password are required.");
      return;
    }

    setIsLoading(true);
    try {
      setErrorMessage("");

      // Simulate authentication here
      // Redirect to yearbooks page after successful login
      router.push('/yearbooks');
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-fixed" style={{ backgroundImage: 'url(/scrapbook-bg.jpg)' }}>
      <h1 className="text-4xl font-bold mb-8 text-center text-pink-600">Login</h1>
      
      {/* Polaroid Container */}
      <div className="relative bg-white shadow-2xl rounded-lg p-6 w-full max-w-sm 
                      before:content-[''] before:absolute before:-top-4 before:left-8 before:w-16 before:h-4 before:bg-yellow-400 before:rotate-12
                      after:content-[''] after:absolute after:-bottom-4 after:right-8 after:w-16 after:h-4 after:bg-yellow-400 after:-rotate-12">
        {/* Tape Strips */}
        <div className="absolute top-0 left-0 w-24 h-4 bg-yellow-500 transform -rotate-12"></div>
        <div className="absolute bottom-0 right-0 w-24 h-4 bg-yellow-500 transform rotate-12"></div>
        
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
        {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}
      </div>
    </div>
  );
};

export default LoginPage;
