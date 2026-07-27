import React, { createContext, useState } from "react";

export const Usercontext = createContext();

export default function UserProvide({ children }) {
  const [user, setuser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  return (
    <Usercontext.Provider value={{ user, setuser }}>
      {children}
    </Usercontext.Provider>
  );
}
