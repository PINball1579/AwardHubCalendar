import { SignInGate } from "@/components/SignInGate";
import { CalendarView } from "@/components/CalendarView";

export default function Home() {
  return (
    <SignInGate>
      <CalendarView />
    </SignInGate>
  );
}
