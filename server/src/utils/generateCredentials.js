// Generates a random password for a new farmer/supplier account so the
// admin can hand it over directly instead of the user picking their own -
// this is what keeps signup admin-only.
export const generatePassword = (length = 10) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};
