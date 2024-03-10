"use client";
import React, { useState } from "react";
import MobxStore from "../../mobx";

const PasswordResetForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await MobxStore.sendPasswordReset(email);
    // Optionally, show confirmation message
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
};

export default PasswordResetForm;
