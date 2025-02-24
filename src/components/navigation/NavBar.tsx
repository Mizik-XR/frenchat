
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/auth/UserAvatar";

export function NavBar() {
  return (
    <nav className="w-full bg-background border-b pl-64">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div />
        <UserAvatar />
      </div>
    </nav>
  );
}
