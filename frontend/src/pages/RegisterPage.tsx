import { useState } from "react";
// Import the custom configured api instance you built in src/api/axios.ts
import api from "../api/axios"; 
import { useAuthStore } from "../store/authStore";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  
  // Get the login action from your Zustand store to save the token on success
  const login = useAuthStore((state) => state.login);

  const handleFormSubmit = async (e: React.FormEvent) => {
    // 1. Prevent the browser from refreshing the page
    e.preventDefault();

    try {
        // 2. Send the registration request to your backend api route group
        const response = await api.post('/auth/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation 
        });
        
        console.log('Registration Successful', response.data);

        // 3. Destructure the user and token from your backend response
        const { user, token } = response.data;

        // 4. Save them to your Zustand global state
        login(user, token);

    } catch (error) {
        console.error('Registration Failed', error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
      </div>

      <div>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
        />
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      </div>

      <div>
        <input
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="Confirm Password"
          required
        />
      </div>

      <button type="submit">Register</button>
    </form>
  );
};

export default Register;