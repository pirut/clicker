"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, SendHorizontal, Zap } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/instantdb";
import { cn } from "@/lib/utils";

const room = db.room("chat", "main");
const QUICK_REACTIONS = ["🔥", "⚡", "🌸", "💖", "☄️"] as const;

type ChatMessage = {
    messageId: string;
    userId: string;
    displayName: string;
    profileImageUrl?: string;
    cursorColor?: string;
    text: string;
    sentAt: number;
};

type EmojiBurst = {
    burstId: string;
    emoji: string;
    userId: string;
    displayName: string;
    sentAt: number;
};

type LiveChatPanelProps = {
    className?: string;
};

function formatClock(timestamp: number) {
    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
    }).format(timestamp);
}

export function LiveChatPanel({ className }: LiveChatPanelProps) {
    const { userId, isLoaded } = useAuth();
    const { user, isSignedIn } = useUser();
    const { user: instantUser, isLoading: authLoading } = db.useAuth();
    const { data: profileData } = db.useQuery(
        userId ? { displayNames: { $: { where: { userId } } } } : null
    );

    const profile = profileData?.displayNames?.[0];
    const displayName =
        profile?.displayName || user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";
    const profileImageUrl = profile?.profileImageUrl || user?.imageUrl || "";
    const cursorColor = profile?.cursorColor;

    const [draft, setDraft] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [bursts, setBursts] = useState<EmojiBurst[]>([]);
    const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

    const { peers } = db.rooms.usePresence(room, {
        keys: ["name", "profileImageUrl", "cursorColor", "hatSlug", "accessorySlug", "effectSlug", "clicksGiven"],
    });
    const peerList = useMemo(() => Object.values(peers), [peers]);
    const typing = db.rooms.useTypingIndicator(room, "arena-chat-input", {
        timeout: 1600,
        stopOnEnter: true,
    });
    const publishMessage = db.rooms.usePublishTopic(room, "messages");
    const publishEmojiBurst = db.rooms.usePublishTopic(room, "emojiBursts");

    const appendMessage = useCallback((message: ChatMessage) => {
        setMessages((current) => {
            if (current.some((existing) => existing.messageId === message.messageId)) {
                return current;
            }

            return [...current, message]
                .sort((a, b) => a.sentAt - b.sentAt)
                .slice(-40);
        });
    }, []);

    const appendBurst = useCallback((burst: EmojiBurst) => {
        setBursts((current) => {
            if (current.some((existing) => existing.burstId === burst.burstId)) {
                return current;
            }

            return [...current, burst].slice(-6);
        });

        window.setTimeout(() => {
            setBursts((current) => current.filter((entry) => entry.burstId !== burst.burstId));
        }, 1800);
    }, []);

    db.rooms.useTopicEffect(room, "messages", (message) => {
        appendMessage(message);
    });

    db.rooms.useTopicEffect(room, "emojiBursts", (burst) => {
        appendBurst(burst);
    });

    useEffect(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length, typing.active.length]);

    const canChat = isSignedIn && !authLoading && !!instantUser;
    const onlineNow = peerList.length + (isSignedIn ? 1 : 0);

    const typingNames = useMemo(() => {
        return typing.active
            .map((peer) => peer.name)
            .filter((name): name is string => Boolean(name))
            .slice(0, 3);
    }, [typing.active]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canChat || !userId) {
            return;
        }

        const text = draft.trim();
        if (!text) return;

        const message: ChatMessage = {
            messageId: crypto.randomUUID(),
            userId,
            displayName,
            profileImageUrl,
            cursorColor,
            text,
            sentAt: Date.now(),
        };

        appendMessage(message);
        publishMessage(message);
        setDraft("");
        typing.setActive(false);
    };

    const sendReaction = (emoji: string) => {
        if (!canChat || !userId) return;

        const burst: EmojiBurst = {
            burstId: crypto.randomUUID(),
            emoji,
            userId,
            displayName,
            sentAt: Date.now(),
        };

        appendBurst(burst);
        publishEmojiBurst(burst);
    };

    return (
        <section className={cn("glass overflow-hidden rounded-3xl border border-border/75", className)}>
            <div className="border-b border-border/70 px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Live Chat</p>
                        <h2 className="mt-1 text-base font-semibold tracking-tight sm:text-lg">Talk while the room is moving</h2>
                    </div>
                    <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {onlineNow} live
                    </div>
                </div>
            </div>

            <div className="border-b border-border/65 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/65 px-3 py-1.5 text-xs text-muted-foreground">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        Quick reactions
                    </div>
                    {QUICK_REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => sendReaction(emoji)}
                            disabled={!canChat}
                            className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-sm transition-colors hover:border-primary/30 hover:bg-primary/8 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Send ${emoji} reaction`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative h-[22rem] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <AnimatePresence>
                        {bursts.map((burst, index) => (
                            <motion.div
                                key={burst.burstId}
                                initial={{ opacity: 0, y: 10, scale: 0.7 }}
                                animate={{ opacity: 1, y: -42 - index * 10, scale: 1.1 }}
                                exit={{ opacity: 0, y: -72, scale: 0.85 }}
                                transition={{ duration: 1.1, ease: "easeOut" }}
                                className="absolute right-6 top-8 text-2xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
                            >
                                <span role="img" aria-label={`${burst.displayName} reaction`}>
                                    {burst.emoji}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="h-full overflow-y-auto px-4 py-4 sm:px-5">
                    {messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="grid h-14 w-14 place-items-center rounded-full border border-border/70 bg-card/75 text-primary">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <p className="mt-4 text-sm font-medium">The lounge is quiet.</p>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                Send the first message and it will appear instantly for everyone currently in the room.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map((message) => {
                                const isSelf = message.userId === userId;

                                return (
                                    <div
                                        key={message.messageId}
                                        className={cn("flex items-end gap-2.5", isSelf && "justify-end")}
                                    >
                                        {!isSelf ? (
                                            <UserAvatar
                                                size="sm"
                                                cursorColor={message.cursorColor}
                                                fallbackSeed={message.displayName}
                                                profileImageUrl={message.profileImageUrl}
                                                showClicksBadge={false}
                                                showParticles={false}
                                            />
                                        ) : null}

                                        <div className={cn("max-w-[78%]", isSelf && "text-right")}>
                                            <div className={cn("mb-1 flex items-center gap-2 text-xs text-muted-foreground", isSelf && "justify-end")}>
                                                <span className="truncate font-medium text-foreground/85">{message.displayName}</span>
                                                <span>{formatClock(message.sentAt)}</span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                                                    isSelf
                                                        ? "border-primary/35 bg-primary/10 text-foreground"
                                                        : "border-border/70 bg-card/75 text-foreground"
                                                )}
                                            >
                                                {message.text}
                                            </div>
                                        </div>

                                        {isSelf ? (
                                            <UserAvatar
                                                size="sm"
                                                cursorColor={cursorColor}
                                                fallbackSeed={displayName}
                                                profileImageUrl={profileImageUrl}
                                                showClicksBadge={false}
                                                showParticles={false}
                                            />
                                        ) : null}
                                    </div>
                                );
                            })}

                            {typingNames.length > 0 ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <span>
                                        {typingNames.join(", ")}
                                        {typingNames.length === 1 ? " is" : " are"} typing...
                                    </span>
                                </div>
                            ) : null}

                            <div ref={scrollAnchorRef} />
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-border/70 p-4 sm:p-5">
                <div className="flex gap-2">
                    <Input
                        {...typing.inputProps}
                        value={draft}
                        onChange={(event) => {
                            const nextValue = event.target.value;
                            setDraft(nextValue);
                            typing.setActive(nextValue.trim().length > 0);
                        }}
                        placeholder={
                            canChat
                                ? "Call your shot, hype the room, or coordinate a click run..."
                                : "Sign in and sync to join the live chat"
                        }
                        disabled={!canChat}
                        maxLength={180}
                        className="h-11 rounded-2xl bg-background/70"
                    />
                    <Button
                        type="submit"
                        disabled={!canChat || draft.trim().length === 0}
                        className="h-11 rounded-2xl px-4"
                    >
                        <SendHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                {!canChat ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                        {isLoaded ? "Chat unlocks once your account is signed in and synced to InstantDB." : "Connecting your session..."}
                    </p>
                ) : null}
            </form>
        </section>
    );
}
