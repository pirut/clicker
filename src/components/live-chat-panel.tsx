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
            return [...current, message].sort((a, b) => a.sentAt - b.sentAt).slice(-40);
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
        if (!canChat || !userId) return;
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
        <section className={cn("kraft-label overflow-hidden", className)}>
            {/* Header */}
            <div className="border-b-2 border-dashed border-border/50 px-4 py-3.5 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono">Live Chat</p>
                        <h2 className="mt-0.5 text-sm font-display font-semibold tracking-tight sm:text-base">Talk while the room is moving</h2>
                    </div>
                    <div className="stamp-badge text-primary">
                        {onlineNow} live
                    </div>
                </div>
            </div>

            {/* Reactions */}
            <div className="border-b border-border/40 px-4 py-2.5 sm:px-5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        React
                    </div>
                    {QUICK_REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => sendReaction(emoji)}
                            disabled={!canChat}
                            className="rounded-full border border-border/40 bg-secondary/40 px-2.5 py-1 text-sm transition-colors hover:bg-card hover:shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Send ${emoji} reaction`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="relative h-[20rem] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <AnimatePresence>
                        {bursts.map((burst, index) => (
                            <motion.div
                                key={burst.burstId}
                                initial={{ opacity: 0, y: 10, scale: 0.7 }}
                                animate={{ opacity: 1, y: -42 - index * 10, scale: 1.1 }}
                                exit={{ opacity: 0, y: -72, scale: 0.85 }}
                                transition={{ duration: 1.1, ease: "easeOut" }}
                                className="absolute right-5 top-8 text-2xl"
                            >
                                <span role="img" aria-label={`${burst.displayName} reaction`}>
                                    {burst.emoji}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="h-full overflow-y-auto px-4 py-3 sm:px-5">
                    {messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="grid h-12 w-12 place-items-center rounded-full border border-border/40 bg-secondary/50 text-primary">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <p className="mt-3 text-sm font-medium">The lounge is quiet.</p>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                Send the first message and it appears instantly for everyone.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {messages.map((message) => {
                                const isSelf = message.userId === userId;
                                return (
                                    <div
                                        key={message.messageId}
                                        className={cn("flex items-end gap-2", isSelf && "justify-end")}
                                    >
                                        {!isSelf && (
                                            <UserAvatar
                                                size="sm"
                                                cursorColor={message.cursorColor}
                                                fallbackSeed={message.displayName}
                                                profileImageUrl={message.profileImageUrl}
                                                showClicksBadge={false}
                                                showParticles={false}
                                            />
                                        )}

                                        <div className={cn("max-w-[78%]", isSelf && "text-right")}>
                                            <div className={cn("mb-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground", isSelf && "justify-end")}>
                                                <span className="truncate font-medium text-foreground/80">{message.displayName}</span>
                                                <span>{formatClock(message.sentAt)}</span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "rounded-2xl border px-3 py-2 text-sm leading-relaxed",
                                                    isSelf
                                                        ? "border-primary/25 bg-primary/8"
                                                        : "border-border/40 bg-secondary/50"
                                                )}
                                            >
                                                {message.text}
                                            </div>
                                        </div>

                                        {isSelf && (
                                            <UserAvatar
                                                size="sm"
                                                cursorColor={cursorColor}
                                                fallbackSeed={displayName}
                                                profileImageUrl={profileImageUrl}
                                                showClicksBadge={false}
                                                showParticles={false}
                                            />
                                        )}
                                    </div>
                                );
                            })}

                            {typingNames.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                    <span>
                                        {typingNames.join(", ")}
                                        {typingNames.length === 1 ? " is" : " are"} typing...
                                    </span>
                                </div>
                            )}

                            <div ref={scrollAnchorRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-border/40 p-3.5 sm:p-4">
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
                                ? "Say something to the room..."
                                : "Sign in to join the chat"
                        }
                        disabled={!canChat}
                        maxLength={180}
                        className="h-10 rounded-xl bg-input"
                    />
                    <Button
                        type="submit"
                        disabled={!canChat || draft.trim().length === 0}
                        className="h-10 rounded-xl px-3.5"
                    >
                        <SendHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                {!canChat && (
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {isLoaded ? "Chat unlocks once signed in and synced." : "Connecting..."}
                    </p>
                )}
            </form>
        </section>
    );
}
