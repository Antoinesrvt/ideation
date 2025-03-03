import * as React from "react";
import { cn } from "@/lib/utils";

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant = "received", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-max max-w-[80%] items-start gap-2 p-2",
          variant === "sent" ? "ml-auto" : "mr-auto",
          className
        )}
        {...props}
      />
    );
  }
);
ChatBubble.displayName = "ChatBubble";

interface ChatBubbleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
}

const ChatBubbleAvatar = React.forwardRef<HTMLDivElement, ChatBubbleAvatarProps>(
  ({ className, src, fallback, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-800",
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={fallback}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          fallback
        )}
      </div>
    );
  }
);
ChatBubbleAvatar.displayName = "ChatBubbleAvatar";

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  isLoading?: boolean;
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
  ({ className, variant = "received", isLoading = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg px-4 py-2 text-sm",
          variant === "sent"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.2s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.4s]"></div>
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

export { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage };