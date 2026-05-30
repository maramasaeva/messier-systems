import { redirect } from "next/navigation"

// the 3D workstation is now the main experience at "/"; keep this path working
export default function Page() {
  redirect("/")
}
