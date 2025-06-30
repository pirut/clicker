"use client";

import { Button } from "@/components/ui/button";
import { recordClick } from "@/app/actions/user";

export default function GiveClickButton() {
    return (
        <Button size="lg" onClick={() => recordClick()}>
            Give Me a Click
        </Button>
    );
}
