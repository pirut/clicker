import { redirect } from "next/navigation";

export default function ThankYouRedirect() {
    redirect("/thank-you/1");
    return null;
}
