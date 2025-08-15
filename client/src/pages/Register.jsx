import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import API from "../utils/api";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.type === "email" ? "email" : e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      saveToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        className="bg-white p-6 rounded shadow w-96"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-bold mb-4">Register</h1>
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        <Button type="submit">Sign Up</Button>
      </form>
    </div>
  );
}
