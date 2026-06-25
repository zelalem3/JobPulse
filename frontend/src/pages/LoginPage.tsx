import { useState } from "react";
import api from '../api/axios';
// 1. Import your Zustand store hook
import { useAuthStore } from '../store/authStore'; 

const Login = () => {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");


  const loginAction = useAuthStore((state) => state.login);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });
      
      console.log("login successful", response.data);

      
      const { user, token } = response.data;

      
      loginAction(user, token);

    } catch (error: any) {
      if (error.response && error.response.status === 422) {
          console.error("Laravel Validation Error Details:", error.response.data.errors);
          alert(Object.values(error.response.data.errors).flat().join("\n"));
      } else {
          console.error("Generic Login Failure:", error);
      }
    }
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div>
        <input
          type="email" 
          value={email}
          onChange={(e) => setemail(e.target.value)}
          placeholder="Enter email"
          required
        />
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
      </div>

      <button type="submit">Login</button>
    </form>
  );
};

export default Login;