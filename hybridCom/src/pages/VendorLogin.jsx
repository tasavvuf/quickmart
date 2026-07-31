import Login from "./Login";

export default function VendorLogin() {
  return (
    <Login
      role="vendor"
      title="Vendor login"
      submitLabel="Login as vendor"
      signupPath="/vendor-signup"
      successPath="/"
    />
  );
}
