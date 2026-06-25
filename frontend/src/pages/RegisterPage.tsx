import { useState } from "react";

import axios from "../services/axios"; 
import { useAuthStore } from "../store/authStore";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const login = useAuthStore((state) => state.login);

  const handleFormSubmit = async (e: React.FormEvent) => {
 
    e.preventDefault();

    try {

        const response = await axios.post('/auth/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation 
        });
        
        console.log('Registration Successful', response.data);

     
        const { user, token } = response.data;

     
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